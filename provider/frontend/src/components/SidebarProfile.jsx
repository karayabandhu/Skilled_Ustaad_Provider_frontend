import React from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaUser, FaBriefcase, FaBell } from "react-icons/fa";

const SidebarProfile = () => {
  const linkClass =
    "flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700";
  const activeClass = "bg-gray-300 dark:bg-gray-600";

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md h-[calc(100vh-4rem)]">
      <nav className="flex flex-col p-4 space-y-3">
        <NavLink
          to="dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <FaTachometerAlt /> <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="details"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <FaUser /> <span>Profile</span>
        </NavLink>
        <NavLink
          to="jobs"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <FaBriefcase /> <span>Jobs</span>
        </NavLink>
        <NavLink
          to="notifications"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          <FaBell /> <span>Notifications</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default SidebarProfile;
