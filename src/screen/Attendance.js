import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/Attendance.css";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const { user } = useAuth();
  const location = useLocation();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

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
        console.log("Fetching attendance for date:", targetDate);

        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from("attendance_log")
          .select(`
            attendance_id,
            date,
            status,
            student_assign_id,
            teacher_assign_id
          `)
          .eq("date", targetDate)
          .eq("teacher_assign_id", teacherData.teacher_id);

        if (attendanceError) throw attendanceError;

        // Get the full student details for these records
        const { data: fullRecords, error: fullError } = await supabase
          .from("student_assign")
          .select(`
            student_assign_id,
            students (
              student_lrn,
              last_name,
              first_name
            )
          `)
          .in("student_assign_id", attendanceRecords.map(r => r.student_assign_id));

        if (fullError) throw fullError;

        // Combine the data
        const cleanedRecords = attendanceRecords.map(record => {
          const studentInfo = fullRecords.find(r => r.student_assign_id === record.student_assign_id);
          return {
            attendance_id: record.attendance_id,
            student_lrn: studentInfo?.students?.student_lrn || '',
            full_name: studentInfo?.students 
              ? `${studentInfo.students.last_name}, ${studentInfo.students.first_name}`
              : '',
            status: record.status.trim(),
            date: record.date
          };
        }).sort((a, b) => a.full_name.localeCompare(b.full_name));

        setAttendanceData(cleanedRecords);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err.message);
      }
    },
    [user, today]
  );

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

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchAttendanceData, location.search, selectedDate, today]);

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    fetchAttendanceData(newDate);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  return (
    <div className="attendance-container">
      <h1>Attendance Records</h1>
      {error && <p className="error-message">Error: {error}</p>}

      <div className="date-selector">
        <input
          type="date"
          value={selectedDate || today}
          onChange={handleDateChange}
          className="date-input"
        />
      </div>

      <div>
        <h3>Attendance for {selectedDate || today}</h3>
      </div>

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Attendance ID</th>
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
                <td>{entry.attendance_id}</td>
                <td>{entry.student_lrn}</td>
                <td>{entry.full_name}</td>
                <td>
                  <div
                    className={`attendance-status ${
                      entry.status === "present" ? "present" : "absent"
                    }`}
                  >
                    {entry.status === "present" ? "✔" : "✘"}
                  </div>
                </td>
                <td>{formatTime(entry.date)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No attendance records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;
