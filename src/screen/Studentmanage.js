import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Studentmanage.css";
import { supabase } from "../lib/supabaseClient";

function Studentmanage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState(""); // Initialize to empty string
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [sections, setSections] = useState([]);
  const [newStudent, setNewStudent] = useState({
    student_lrn: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    contact_number: "",
    parent_name: "",
    address: "",
  });

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
    fetchSections();
  }, [selectedSection]); // Re-fetch students when selectedSection changes

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase.from("sections").select("*");
      if (error) throw error;
      console.log("Fetched sections:", data);
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error.message);
    }
  };

  const fetchStudents = async () => {
    try {
      let query = supabase.from("students").select(`
        *,
        sections:section_id (
          section_name
        )
      `);

      if (selectedSection) {
        query = query.eq("section_id", selectedSection);
      }

      const { data, error } = await query;

      if (error) throw error;

      const studentsWithStatus = data.map((student) => ({
        ...student,
        status: student.status || "active",
      }));
      setStudents(studentsWithStatus);
    } catch (error) {
      console.error("Error fetching students:", error.message);
    }
  };

  const handleAdd = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .insert([
          {
            student_lrn: newStudent.student_lrn,
            first_name: newStudent.first_name,
            middle_name: newStudent.middle_name,
            last_name: newStudent.last_name,
            contact_number: newStudent.contact_number,
            parent_name: newStudent.parent_name,
            address: newStudent.address,
            section_id: selectedSection,
            status: "active",
          },
        ])
        .select();

      if (error) throw error;

      setStudents([...students, data[0]]);
      setNewStudent({
        student_lrn: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        contact_number: "",
        parent_name: "",
        address: "",
      });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding student:", error.message);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("students")
        .update({
          first_name: editingStudent.first_name,
          middle_name: editingStudent.middle_name,
          last_name: editingStudent.last_name,
          contact_number: editingStudent.contact_number,
          parent_name: editingStudent.parent_name,
          address: editingStudent.address,
        })
        .eq("student_lrn", editingStudent.student_lrn);

      if (error) throw error;

      setStudents(
        students.map((student) =>
          student.student_lrn === editingStudent.student_lrn
            ? editingStudent
            : student
        )
      );
      setIsEditing(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("Error updating student:", error.message);
    }
  };

  const handleToggleStatus = async (student_lrn, currentStatus) => {
    try {
      const newStatus = currentStatus === "inactive" ? "active" : "inactive";
      const { error } = await supabase
        .from("students")
        .update({ status: newStatus })
        .eq("student_lrn", student_lrn);

      if (error) throw error;

      // Update the local state to reflect the change
      setStudents(
        students.map((student) =>
          student.student_lrn === student_lrn
            ? { ...student, status: newStatus }
            : student
        )
      );
    } catch (error) {
      console.error("Error toggling student status:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="student-manage">
      <div className="sidebar">
        {/* <div className="sidebar-item">ADMIN 1</div> */}
        <Link
          to="/SectionManage"
          className="sidebar-item"
          style={{ textDecoration: "none", color: "black" }}
        >
          SECTIONS
        </Link>
        <div className="sidebar-item active">STUDENTS</div>
        <Link
          to="/teachermanage"
          className="sidebar-item"
          style={{ textDecoration: "none" }}
        >
          TEACHERS
        </Link>
        <div
          className="sidebar-item"
          style={{ marginTop: "auto", cursor: "pointer" }}
          onClick={handleLogout}
        >
          LOG OUT
        </div>
      </div>

      <div className="main-content">
        <div className="header-info">
          <div className="info-group">
            <div className="number">1</div>
            <div className="label">SECTION</div>
          </div>
          <div className="separator">|</div>
          <div className="info-group">
            <div className="number">{students.length}</div>
            <div className="label">STUDENTS</div>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            className="search-bar"
            placeholder="search students"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="controls">
          <select
            className="section-dropdown"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">All Sections</option>
            {sections.map((section) => (
              <option key={section.section_id} value={section.section_id}>
                {section.section_name}
              </option>
            ))}
          </select>

          <button className="add-button" onClick={() => setIsAdding(true)}>
            <span style={{ fontSize: "24px" }}>+</span>
            add student
          </button>
        </div>

        <table className="students-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>STATUS</th>
              <th>LRN</th>
              <th>PARENTS #</th>
              <th> Actions</th>
            </tr>
          </thead>
          <tbody>
            {students
              .filter((student) => {
                const matchesSearch =
                  student.first_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  student.last_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                return matchesSearch;
              })
              .map((student) => (
                <tr key={student.student_lrn}>
                  <td>{`${student.first_name} ${student.last_name}`}</td>
                  <td>{student.status?.toUpperCase() || "ACTIVE"}</td>
                  <td>{student.student_lrn}</td>
                  <td>{student.contact_number}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(student)}
                      >
                        Edit
                      </button>
                      <button
                        className={`delete-button ${
                          student.status === "inactive" ? "disabled" : ""
                        }`}
                        onClick={() =>
                          handleToggleStatus(
                            student.student_lrn,
                            student.status
                          )
                        }
                      >
                        {student.status === "inactive" ? "Enable" : "Disable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="add-form">
          <h2>Add New Student</h2>
          <div className="form-fields">
            <input
              type="text"
              placeholder="LRN"
              value={newStudent.student_lrn}
              onChange={(e) =>
                setNewStudent({ ...newStudent, student_lrn: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="First Name"
              value={newStudent.first_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, first_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Middle Name"
              value={newStudent.middle_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, middle_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newStudent.last_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, last_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder=" Contact Number"
              value={newStudent.contact_number}
              onChange={(e) =>
                setNewStudent({ ...newStudent, contact_number: e.target.value })
              }
            />
            {/* <input
              type="text"
              placeholder="Parent Name"
              value={newStudent.parent_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, parent_name: e.target.value })
              }
            /> */}
            <input
              type="text"
              placeholder="Address"
              value={newStudent.address}
              onChange={(e) =>
                setNewStudent({ ...newStudent, address: e.target.value })
              }
            />
            <div className="form-buttons">
              <button className="save-button" onClick={handleAdd}>
                Save
              </button>
              <button
                className="cancel-button"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="add-form">
          <h2>Edit Student</h2>
          <div className="form-fields">
            <input
              type="text"
              placeholder="First Name"
              value={editingStudent.first_name}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  first_name: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Middle Name"
              value={editingStudent.middle_name}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  middle_name: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              value={editingStudent.last_name}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  last_name: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Contact Number"
              value={editingStudent.contact_number}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  contact_number: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Parent Name"
              value={editingStudent.parent_name}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  parent_name: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Address"
              value={editingStudent.address}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  address: e.target.value,
                })
              }
            />
            <div className="form-buttons">
              <button className="save-button" onClick={handleUpdate}>
                Update
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingStudent(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Studentmanage;
