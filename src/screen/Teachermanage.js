import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Teachermanage.css";
import { supabase } from "../lib/supabaseClient";

function Teachermanage() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [newTeacher, setNewTeacher] = useState({
    teacher_id: "",
    teacher: "",
    username: "",
    password: "",
    email: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase.from("teachers").select("*");
      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error.message);
    }
  };

  const handleAdd = async () => {
    try {
      if (!newTeacher.teacher || !newTeacher.username || !newTeacher.password || !newTeacher.email) {
        alert("Please fill in all fields");
        return;
      }

      const { data, error } = await supabase
        .from("teachers")
        .insert([
          {
            teacher: newTeacher.teacher,
            username: newTeacher.username,
            password: newTeacher.password,
            email: newTeacher.email,
          },
        ])
        .select();

      if (error) throw error;
      setTeachers([...teachers, data[0]]);
      setNewTeacher({
        teacher_id: "",
        teacher: "",
        username: "",
        password: "",
        email: "",
      });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding teacher:", error.message);
      alert("Error adding teacher. Please try again.");
    }
  };

  const handleEdit = async () => {
    try {
      if (!editingTeacher.teacher || !editingTeacher.username || !editingTeacher.email) {
        alert("Please fill in all fields");
        return;
      }

      const { error } = await supabase
        .from("teachers")
        .update({
          teacher: editingTeacher.teacher,
          username: editingTeacher.username,
          password: editingTeacher.password,
          email: editingTeacher.email,
        })
        .eq("teacher_id", editingTeacher.teacher_id);

      if (error) throw error;

      setTeachers(
        teachers.map((t) =>
          t.teacher_id === editingTeacher.teacher_id ? editingTeacher : t
        )
      );
      setIsEditing(false);
      setEditingTeacher(null);
    } catch (error) {
      console.error("Error updating teacher:", error.message);
      alert("Error updating teacher. Please try again.");
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
          style={{ textDecoration: "none" }}
        >
          SECTIONS
        </Link>        <Link
          to="/studentmanage"
          className="sidebar-item"
          style={{ textDecoration: "none" }}
        >
          STUDENTS
        </Link>
        <div className="sidebar-item active">TEACHERS</div>
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
            <div className="number">{teachers.length}</div>
            <div className="label">TEACHERS</div>
          </div>
          <div className="separator">|</div>
          <div className="info-group">
            <div className="number">5</div>
            <div className="label">DEPARTMENTS</div>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            className="search-bar"
            placeholder="search teachers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="controls">
          <button className="add-button" onClick={() => setIsAdding(true)}>
            <span style={{ fontSize: "24px" }}>+</span>
            add teacher
          </button>
        </div>

        <table>
          <thead>
            <tr >
              <th style={{ backgroundColor: "white", color: "black" }}>Teacher Name</th>
              <th style={{ backgroundColor: "white", color: "black" }}>Username</th>
              <th style={{ backgroundColor: "white", color: "black" }}>Email</th>
              {/* <th >Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {teachers
              .filter((teacher) =>
                teacher.teacher?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((teacher) => (
                <tr key={teacher.teacher_id}>
                  <td>{teacher.teacher}</td>
                  <td>{teacher.username}</td>
                  <td>{teacher.email}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {isAdding && (
          <div className="add-form">
            <h2>Add New Teacher</h2>
            <div className="form-fields">
              <input
                type="text"
                placeholder="Full Name"
                value={newTeacher.teacher}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, teacher: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Username"
                value={newTeacher.username}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, username: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={newTeacher.password}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, password: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={newTeacher.email}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, email: e.target.value })
                }
              />
              <div className="form-buttons">
                <button className="save-button" onClick={handleAdd}>
                  Save
                </button>
                <button className="cancel-button" onClick={() => setIsAdding(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="add-form">
            <h2>Edit Teacher</h2>
            <div className="form-fields">
              <input
                type="text"
                placeholder="Full Name"
                value={editingTeacher.teacher}
                onChange={(e) =>
                  setEditingTeacher({ ...editingTeacher, teacher: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Username"
                value={editingTeacher.username}
                onChange={(e) =>
                  setEditingTeacher({ ...editingTeacher, username: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                value={editingTeacher.password}
                onChange={(e) =>
                  setEditingTeacher({ ...editingTeacher, password: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                value={editingTeacher.email}
                onChange={(e) =>
                  setEditingTeacher({ ...editingTeacher, email: e.target.value })
                }
              />
              <div className="form-buttons">
                <button className="save-button" onClick={handleEdit}>
                  Save Changes
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingTeacher(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teachermanage;



// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import "../styles/Studentmanage.css";
// import { supabase } from "../lib/supabaseClient";

// function Teachermanage() {
//   const [teachers, setTeachers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isAdding, setIsAdding] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingTeacher, setEditingTeacher] = useState(null);
//   const [newTeacher, setNewTeacher] = useState({
//     teacher_id: "",
//     teacher: "",
//     username: "",
//     password: "",
//     email: "",
//   });
//   const [showMenu, setShowMenu] = useState(false);

//   useEffect(() => {
//     fetchTeachers();
//   }, []);

//   const fetchTeachers = async () => {
//     try {
//       const { data, error } = await supabase.from("teachers").select("*");
//       if (error) throw error;
//       setTeachers(data || []);
//     } catch (error) {
//       console.error("Error fetching teachers:", error.message);
//     }
//   };

//   const handleAdd = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("teachers")
//         .insert([
//           {
//             teacher_id: newTeacher.teacher_id,
//             teacher: newTeacher.teacher,
//             username: newTeacher.username,
//             password: newTeacher.password,
//             email: newTeacher.email,
//           },
//         ])
//         .select();

//       if (error) throw error;

//       setTeachers([...teachers, data[0]]);
//       setNewTeacher({
//         teacher_id: "",
//         teacher: "",
//         username: "",
//         password: "",
//         email: "",
//       });
//       setIsAdding(false);
//     } catch (error) {
//       console.error("Error adding teacher:", error.message);
//     }
//   };

//   const handleEdit = (teacher) => {
//     setEditingTeacher(teacher);
//     setIsEditing(true);
//   };

//   const handleUpdate = async () => {
//     try {
//       const { error } = await supabase
//         .from("teachers")
//         .update({
//           teacher: editingTeacher.teacher,
//           username: editingTeacher.username,
//           password: editingTeacher.password,
//           email: editingTeacher.email,
//         })
//         .eq("teacher_id", editingTeacher.teacher_id);

//       if (error) throw error;

//       setTeachers(
//         teachers.map((teacher) =>
//           teacher.teacher_id === editingTeacher.teacher_id
//             ? editingTeacher
//             : teacher
//         )
//       );
//       setIsEditing(false);
//       setEditingTeacher(null);
//     } catch (error) {
//       console.error("Error updating teacher:", error.message);
//     }
//   };

//   const handleDelete = async (teacher_id) => {
//     try {
//       const { error } = await supabase
//         .from("teachers")
//         .delete()
//         .eq("teacher_id", teacher_id);

//       if (error) throw error;

//       setTeachers(teachers.filter((teacher) => teacher.teacher_id !== teacher_id));
//     } catch (error) {
//       console.error("Error deleting teacher:", error.message);
//     }
//   };

//   const filteredTeachers = teachers.filter(
//     (teacher) =>
//       teacher.teacher?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="student-manage">
//       <div className="header">
//         <div className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
//           ☰
//         </div>
//         <h1>Teacher Management</h1>
//         <button className="add-button" onClick={() => setIsAdding(true)}>
//           Add Teacher
//         </button>
//       </div>

//       {/* Sliding Menu */}
//       <div className={`side-menu ${showMenu ? "active" : ""}`}>
//         <button className="close-btn" onClick={() => setShowMenu(false)}>
//           Close
//         </button>
//         <ul>
//           <li>
//             <Link to="/Profile" onClick={() => setShowMenu(false)} style={{ color: "white" }}>
//               Profile
//             </Link>
//           </li>
//           <li>
//             <Link to="/Studentmanage" onClick={() => setShowMenu(false)} style={{ color: "white" }}>
//               Student Management
//             </Link>
//           </li>
//         </ul>
//       </div>

//       <div className="filters">
//         <input
//           type="text"
//           placeholder="Search teachers..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="search-input"
//         />
//       </div>

//       {isAdding && (
//         <div className="add-form">
//           <h2>Add New Teacher</h2>
//           <div className="form-fields">
//             <input
//               type="text"
//               placeholder="Teacher ID"
//               value={newTeacher.teacher_id}
//               onChange={(e) =>
//                 setNewTeacher({ ...newTeacher, teacher_id: e.target.value })
//               }
//             />
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={newTeacher.teacher}
//               onChange={(e) =>
//                 setNewTeacher({ ...newTeacher, teacher: e.target.value })
//               }
//             />
//             <input
//               type="text"
//               placeholder="Username"
//               value={newTeacher.username}
//               onChange={(e) =>
//                 setNewTeacher({ ...newTeacher, username: e.target.value })
//               }
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={newTeacher.password}
//               onChange={(e) =>
//                 setNewTeacher({ ...newTeacher, password: e.target.value })
//               }
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={newTeacher.email}
//               onChange={(e) =>
//                 setNewTeacher({ ...newTeacher, email: e.target.value })
//               }
//             />
//             <div className="form-buttons">
//               <button className="save-button" onClick={handleAdd}>
//                 Save
//               </button>
//               <button className="cancel-button" onClick={() => setIsAdding(false)}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isEditing && (
//         <div className="add-form">
//           <h2>Edit Teacher</h2>
//           <div className="form-fields">
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={editingTeacher.teacher}
//               onChange={(e) =>
//                 setEditingTeacher({
//                   ...editingTeacher,
//                   teacher: e.target.value,
//                 })
//               }
//             />
//             <input
//               type="text"
//               placeholder="Username"
//               value={editingTeacher.username}
//               onChange={(e) =>
//                 setEditingTeacher({
//                   ...editingTeacher,
//                   username: e.target.value,
//                 })
//               }
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={editingTeacher.password}
//               onChange={(e) =>
//                 setEditingTeacher({
//                   ...editingTeacher,
//                   password: e.target.value,
//                 })
//               }
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={editingTeacher.email}
//               onChange={(e) =>
//                 setEditingTeacher({
//                   ...editingTeacher,
//                   email: e.target.value,
//                 })
//               }
//             />
//             <div className="form-buttons">
//               <button className="save-button" onClick={handleUpdate}>
//                 Update
//               </button>
//               <button
//                 className="cancel-button"
//                 onClick={() => {
//                   setIsEditing(false);
//                   setEditingTeacher(null);
//                 }}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="table-container">
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>TEACHER</th>
//               <th>USERNAME</th>
//               <th>PASSWORD</th>
//               <th>EMAIL</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTeachers.map((teacher) => (
//               <tr key={teacher.teacher_id}>
//                 <td>{teacher.teacher_id}</td>
//                 <td>{teacher.teacher}</td>
//                 <td>{teacher.username}</td>
//                 <td>••••••••</td>
//                 <td>{teacher.email}</td>
//                 <td>
//                   <div className="action-buttons">
//                     <button
//                       className="edit-button"
//                       onClick={() => handleEdit(teacher)}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       className="delete-button"
//                       onClick={() => handleDelete(teacher.teacher_id)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default Teachermanage;
