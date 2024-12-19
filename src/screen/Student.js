import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/Student.css';

const Student = () => {
  const [overrideLogs, setOverrideLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);

  const fetchTeachers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('teacher_id, teacher');

      if (error) throw error;
      setTeachers(data);
    } catch (err) {
      console.error('Error fetching teachers:', err.message);
      setError(err.message);
    }
  }, []); // No dependencies as it doesn't use any external values

  const fetchOverrideLogs = useCallback(async () => {
    if (!currentTeacherId) return;
    
    try {
      const { data, error } = await supabase
        .from('override_log')
        .select(`
          override_id,
          activity,
          reason,
          teacher_id,
          student_lrn,
          date
        `)
        .eq('teacher_id', currentTeacherId)
        .order('date', { ascending: false });

      if (error) throw error;

      // Fetch student details for all student_lrns in the override logs
      const studentLRNs = [...new Set(data.map(log => log.student_lrn))];
      if (studentLRNs.length > 0) {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('student_lrn, first_name, last_name')
          .in('student_lrn', studentLRNs);

        if (studentsError) throw studentsError;
        setStudents(studentsData);
      }

      setOverrideLogs(data);
    } catch (err) {
      console.error('Error fetching override logs:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTeacherId]);

  const getCurrentTeacher = useCallback(async () => {
    try {
      // Get current user's email from session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        setError("Please sign in to view override logs");
        return;
      }

      // Get teacher_id using the email
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('teacher_id')
        .eq('email', session.user.email)
        .single();

      if (teacherError) throw teacherError;

      if (teacherData) {
        setCurrentTeacherId(teacherData.teacher_id);
      }
    } catch (err) {
      console.error('Error getting current teacher:', err.message);
      setError(err.message);
    }
  }, []); // No dependencies as it doesn't use any external values

  const handleDelete = useCallback(async (overrideId, studentLrn, date) => {
    try {
      // First get the override details to know what status to restore
      const { data: overrideData, error: fetchError } = await supabase
        .from('override_log')
        .select('activity')
        .eq('override_id', overrideId)
        .single();

      if (fetchError) throw fetchError;

      // Determine what status to restore to
      const statusToRestore = overrideData.activity.toLowerCase().includes('absent') ? 'present' : 'absent';

      // Delete from override_log
      const { error: deleteError } = await supabase
        .from('override_log')
        .delete()
        .match({ override_id: overrideId, teacher_id: currentTeacherId });

      if (deleteError) throw deleteError;

      // Get the student_assign_id first
      const { data: studentData, error: studentError } = await supabase
        .from('student_assign')
        .select('student_assign_id')
        .eq('student_lrn', studentLrn)
        .single();

      if (studentError) throw studentError;

      // Update the attendance status using student_assign_id
      const { error: updateError } = await supabase
        .from('attendance_log')
        .update({ status: statusToRestore })
        .eq('student_assign_id', studentData.student_assign_id)
        .eq('date', date);

      if (updateError) throw updateError;

      // Update the local state to remove the deleted row
      setOverrideLogs(prev => prev.filter(log => log.override_id !== overrideId));
    } catch (err) {
      console.error('Error deleting override log:', err.message);
      setError(`Failed to delete: ${err.message}`);
    }
  }, [currentTeacherId]);

  const getTeacherName = useCallback((teacherId) => {
    const teacher = teachers.find(t => t.teacher_id === teacherId);
    return teacher ? teacher.teacher : 'Unknown Teacher';
  }, [teachers]);

  const getStudentName = useCallback((studentLRN) => {
    const student = students.find(s => s.student_lrn === studentLRN);
    return student ? `${student.last_name}, ${student.first_name}` : studentLRN;
  }, [students]);

  const formatDateTime = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  }, []);

  useEffect(() => {
    getCurrentTeacher();
  }, [getCurrentTeacher]);

  useEffect(() => {
    if (currentTeacherId) {
      fetchOverrideLogs();
      fetchTeachers();

      // Set up real-time subscription
      const subscription = supabase
        .channel('override_log_changes')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'override_log',
            filter: `teacher_id=eq.${currentTeacherId}`
          },
          () => {
            fetchOverrideLogs();
          }
        )
        .subscribe();

      // Set up auto-refresh interval
      const refreshInterval = setInterval(fetchOverrideLogs, 1000);

      // Cleanup on unmount
      return () => {
        subscription.unsubscribe();
        clearInterval(refreshInterval);
      };
    }
  }, [currentTeacherId, fetchOverrideLogs, fetchTeachers]);

  if (!currentTeacherId && !loading) {
    return <div className="error-message">Please sign in to view override logs</div>;
  }

  return (
    <div className="logs-container">
      <h1>Override Logs</h1>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="override-table">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Student Name</th>
              <th>Teacher Name</th>
              <th>Activity</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {overrideLogs.map(log => (
              <tr key={log.override_id}>
                <td>{formatDateTime(log.date)}</td>
                <td>{getStudentName(log.student_lrn)}</td>
                <td>{getTeacherName(log.teacher_id)}</td>
                <td>{log.activity}</td>
                <td>{log.reason}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(log.override_id, log.student_lrn, log.date)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Student;
