import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Studentmanage.css";
import { supabase } from "../lib/supabaseClient";

function Studentmanage() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
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
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*");

      if (error) throw error;
      setStudents(data || []);
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

  const handleDelete = async (student_lrn) => {
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("student_lrn", student_lrn);

      if (error) throw error;

      setStudents(
        students.filter((student) => student.student_lrn !== student_lrn)
      );
    } catch (error) {
      console.error("Error deleting student:", error.message);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="student-manage">
      <div className="header">
        <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
          ☰
        </div>
        <h1>Student Management</h1>
        <button className="add-button" onClick={() => setIsAdding(true)}>
          Add Student
        </button>
      </div>

      {/* Sliding Menu */}
      <div className={`side-menu ${showMenu ? "active" : ""}`}>
        <button className="close-btn" onClick={() => setShowMenu(false)}>
          Close
        </button>
        <ul>
          <li>
            <Link to="/Profile" onClick={() => setShowMenu(false)} style={{ color: "white" }}>
              Profile
            </Link>
          </li>
          <li>
            <Link to="/Teachermanage" onClick={() => setShowMenu(false)} style={{ color: "white" }}>
              Teacher Management
            </Link>
          </li>
        </ul>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
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
              placeholder="Contact Number"
              value={newStudent.contact_number}
              onChange={(e) =>
                setNewStudent({ ...newStudent, contact_number: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Parent Name"
              value={newStudent.parent_name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, parent_name: e.target.value })
              }
            />
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

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>LRN</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Contact Number</th>
              <th>Parent Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.student_lrn}>
                <td>{student.student_lrn}</td>
                <td>{student.last_name}</td>
                <td>{student.first_name}</td>
                <td>{student.middle_name}</td>
                <td>{student.contact_number}</td>
                <td>{student.parent_name}</td>
                <td>{student.address}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(student.student_lrn)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Studentmanage;
