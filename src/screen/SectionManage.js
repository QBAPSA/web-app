import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../styles/SectionManage.css";

function SectionManage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSection, setNewSection] = useState({
    section_name: "",
    grade_level: "",
    // strand: "",
    academic_year: "",
    adviser: "",
    status: "active",
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        navigate("/"); // Redirect to login if not authenticated
        return;
      }

      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .order("section_name", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error.message);
    }
  };

  const handleAdd = async () => {
    try {
      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("User not authenticated");
      }

      // Validate required fields
      if (!newSection.section_name || !newSection.grade_level) {
        alert("Please fill in Section Name and Grade Level");
        return;
      }

      // Create the section object
      const sectionData = {
        section_name: newSection.section_name,
        grade_level: newSection.grade_level,
        // strand: newSection.strand || null,
        academic_year: newSection.academic_year || null,
        adviser: newSection.adviser || null,
        status: "active",
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from("sections")
        .insert([sectionData])
        .select();

      if (error) {
        throw error;
      }

      // Update local state
      setSections([...sections, data[0]]);

      // Reset form
      setNewSection({
        section_name: "",
        grade_level: "",
        // strand: "",
        academic_year: "",
        adviser: "",
        status: "active",
      });

      // Close form
      setIsAdding(false);

      // Show success message
      alert("Section added successfully!");
    } catch (error) {
      console.error("Error adding section:", error.message);
      alert("Error adding section. Please try again.");
    }
  };

  const handleToggleStatus = async (section_name, currentStatus) => {
    try {
      const newStatus = currentStatus === "inactive" ? "active" : "inactive";
      const { error } = await supabase
        .from("sections")
        .update({ status: newStatus })
        .eq("section_name", section_name); // Using section_name as the identifier

      if (error) throw error;

      setSections(
        sections.map((section) =>
          section.section_name === section_name
            ? { ...section, status: newStatus }
            : section
        )
      );
    } catch (error) {
      console.error("Error toggling section status:", error.message);
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
        <div className="sidebar-item active" style={{ textDecoration: "none" }}>
          SECTIONS
        </div>
        <Link
          to="/studentmanage"
          className="sidebar-item"
          style={{ textDecoration: "none" }}
        >
          STUDENTS
        </Link>
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
            <div className="number">{sections.length}</div>
            <div className="label">TOTAL SECTIONS</div>
          </div>
        </div>

        <div className="search-section">
          <input
            type="text"
            className="search-bar"
            placeholder="Search sections"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="controls">
          <button className="add-button" onClick={() => setIsAdding(true)}>
            <span style={{ fontSize: "24px" }}>+</span>
            add section
          </button>
        </div>

        <table className="students-table">
          <thead>
            <tr>
              <th>SECTION NAME</th>
              <th>GRADE LEVEL</th>
              {/* <th>STRAND</th> */}
              <th>ACADEMIC YEAR</th>
              <th>ADVISER</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {sections
              .filter((section) =>
                section.section_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((section) => (
                <tr key={section.section_name}>
                  <td>{section.section_name}</td>
                  <td>{section.grade_level}</td>
                  <td>{section.academic_year}</td>
                  <td>{section.adviser}</td>
                  <th>{section.status}</th>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="status-button"
                        onClick={() =>
                          handleToggleStatus(
                            section.section_name,
                            section.status
                          )
                        }
                      >
                        {section.status === "active"
                          ? "Deactivate"
                          : "Activate"}
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
          <h2>Add New Section</h2>
          <div className="form-fields">
            <input
              type="text"
              placeholder="Section Name"
              value={newSection.section_name}
              onChange={(e) =>
                setNewSection({ ...newSection, section_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Grade Level"
              value={newSection.grade_level}
              onChange={(e) =>
                setNewSection({ ...newSection, grade_level: e.target.value })
              }
            />
            {/* <input
              type="text"
              placeholder="Strand"
              value={newSection.strand}
              onChange={(e) =>
                setNewSection({ ...newSection, strand: e.target.value })
              }
            /> */}
            <input
              type="text"
              placeholder="Academic Year"
              value={newSection.academic_year}
              onChange={(e) =>
                setNewSection({ ...newSection, academic_year: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Adviser"
              value={newSection.adviser}
              onChange={(e) =>
                setNewSection({ ...newSection, adviser: e.target.value })
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
    </div>
  );
}

export default SectionManage;
