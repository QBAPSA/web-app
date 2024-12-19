import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/Attendance.css";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherId, setTeacherId] = useState(null);
  const [formData, setFormData] = useState({
    activity: "",
    reason: ""
  });
  const { user } = useAuth();
  const location = useLocation();

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    const now = new Date();
    // Adjust for timezone offset
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    // Set selectedDate to today when component mounts
    setSelectedDate(today);
  }, [today]);

  const fetchAttendanceData = useCallback(
    async (date) => {
      try {
        // First, get the teacher record for the logged-in user
        const { data: teacherData, error: teacherError } = await supabase
          .from("teachers")
          .select("teacher_id, teacher")
          .eq("email", user.email)
          .single();

        if (teacherError) throw teacherError;
        console.log("Teacher data:", teacherData);

        // Get attendance records for the teacher with proper date handling
        const targetDate = date || today;
        // Convert targetDate to YYYY-MM-DD format if it's a Date object
        const formattedDate = targetDate instanceof Date ? 
          targetDate.toISOString().split('T')[0] : 
          targetDate;
          
        console.log("Fetching attendance for date:", formattedDate);

        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from("attendance_log")
          .select(
            `
            attendance_id,
            date,
            status,
            student_assign_id,
            teacher_assign_id
          `
          )
          .eq("date", formattedDate)
          .eq("teacher_assign_id", teacherData.teacher_id);

        if (attendanceError) throw attendanceError;

        // Get the full student details for these records
        const { data: fullRecords, error: fullError } = await supabase
          .from("student_assign")
          .select(
            `
            student_assign_id,
            students (
              student_lrn,
              last_name,
              first_name
            )
          `
          )
          .in(
            "student_assign_id",
            attendanceRecords.map((r) => r.student_assign_id)
          );

        if (fullError) throw fullError;

        // Combine the data
        const cleanedRecords = attendanceRecords
          .map((record) => {
            const studentInfo = fullRecords.find(
              (r) => r.student_assign_id === record.student_assign_id
            );
            return {
              attendance_id: record.attendance_id,
              student_lrn: studentInfo?.students?.student_lrn || "",
              full_name: studentInfo?.students
                ? `${studentInfo.students.last_name}, ${studentInfo.students.first_name}`
                : "",
              status: record.status.trim(),
              date: record.date,
            };
          })
          .sort((a, b) => a.full_name.localeCompare(b.full_name));

        setAttendanceData(cleanedRecords);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err.message);
      }
    },
    [user, today]
  );

  useEffect(() => {
    const fetchTeacherName = async () => {
      try {
        const { data, error } = await supabase
          .from("teachers")
          .select("teacher, teacher_id")
          .eq("email", user.email)
          .single();

        if (error) throw error;
        if (data) {
          setTeacherName(data.teacher);
          setTeacherId(data.teacher_id);
        }
      } catch (err) {
        console.error("Error fetching teacher name:", err.message);
      }
    };

    if (user) {
      fetchTeacherName();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Get date from URL params
      const queryParams = new URLSearchParams(location.search);
      const date = queryParams.get("date");
      if (date) {
        setSelectedDate(date);
        fetchAttendanceData(date);
      } else {
        fetchAttendanceData(today);
      }

      // Set up real-time subscription
      const subscription = supabase
        .channel("attendance_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "attendance_log",
          },
          (payload) => {
            console.log("Real-time update:", payload);
            fetchAttendanceData(selectedDate || today);
          }
        )
        .subscribe();

      // Set up background refresh every 3 seconds
      const refreshInterval = setInterval(() => {
        fetchAttendanceData(selectedDate || today);
      }, 1000); // 1 seconds

      return () => {
        subscription.unsubscribe();
        clearInterval(refreshInterval); // Clean up interval on unmount
      };
    }
  }, [user, fetchAttendanceData, location.search, selectedDate, today]);

  const handleStatusClick = (entry) => {
    setSelectedStudent(entry);
    setShowOverrideForm(true);
  };

  const handleCloseForm = () => {
    setShowOverrideForm(false);
    setSelectedStudent(null);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // First, insert into override_log
      const { error: overrideError } = await supabase
        .from("override_log")
        .insert([
          {
            activity: formData.activity,
            reason: formData.reason,
            teacher_id: teacherId,
            student_lrn: selectedStudent.student_lrn,
            date: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (overrideError) throw overrideError;

      // Then update the attendance status
      const newStatus = selectedStudent.status === "present" ? "absent" : "present";
      const { error: attendanceError } = await supabase
        .from("attendance_log")
        .update({ status: newStatus })
        .eq("attendance_id", selectedStudent.attendance_id);

      if (attendanceError) throw attendanceError;

      // Update local state
      setAttendanceData(prev =>
        prev.map(item =>
          item.attendance_id === selectedStudent.attendance_id
            ? { ...item, status: newStatus }
            : item
        )
      );

      // Close the form and reset
      handleCloseForm();
      setFormData({ activity: "", reason: "" });
    } catch (err) {
      console.error("Error submitting override:", err.message);
      setError(err.message);
    }
  };

  return (
    <div className="attendance-container">
      <h1>Attendance Records</h1>
      {error && <p className="error-message">Error: {error}</p>}

      {/* Date picker temporarily disabled */}
      {/* <div className="date-selector">
        <input
          type="date"
          value={selectedDate || today}
          onChange={handleDateChange}
          className="date-input"
        />
      </div> */}

      <div>
        <h3>Attendance for {selectedDate || today}</h3>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Student LRN</th>
            <th>Full Name</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length > 0 ? (
            attendanceData.map((entry) => (
              <tr key={entry.attendance_id}>
                <td>{entry.student_lrn}</td>
                <td>{entry.full_name}</td>
                <td>
                  <div
                    className={`attendance-status ${
                      entry.status === "present" ? "present" : "absent"
                    }`}
                    onClick={() => handleStatusClick(entry)}
                    style={{ cursor: "pointer" }}
                  >
                    {entry.status === "present" ? "✔" : "✘"}
                  </div>
                </td>
                <td>{formatTime(entry.date)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No attendance records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {showOverrideForm && selectedStudent && (
        <div className="override-form-overlay">
          <div className="override-form">
            {/* <h2>Edit Attendance</h2> */}
            <h2>Override Log</h2>

            <div className="form-content">
              <div className="form-group">
                <label>Activity:</label>
                <input
                  type="text"
                  name="activity"
                  value={formData.activity}
                  onChange={handleInputChange}
                  placeholder="Enter activity"
                />
              </div>
              <div className="form-group">
                <label>Reason:</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Enter reason"
                />
              </div>
              <div className="form-group">
                <label>Teacher Name:</label>
                <input type="text" readOnly value={teacherName} />
              </div>
              <div className="form-group">
                <label>Student LRN:</label>
                <input
                  type="text"
                  readOnly
                  value={selectedStudent.student_lrn}
                />
              </div>
            </div>
            <div className="form-actions">
              <button onClick={handleCloseForm}>Cancel</button>
              <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
