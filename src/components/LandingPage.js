import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import './LandingPage.css'; // Import the CSS file

const LandingPage = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    // Fetch initial sections
    const fetchSections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/sections');
        setSections(response.data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSections();

    // Setup Socket.IO for real-time updates
    const socket = io('http://localhost:5000');

    socket.on('section-added', (newSection) => {
      setSections((prev) => [...prev, newSection]);
    });

    socket.on('section-updated', (updatedSection) => {
      setSections((prev) =>
        prev.map((section) =>
          section._id === updatedSection._id ? updatedSection : section
        )
      );
    });

    socket.on('section-deleted', (deletedSectionId) => {
      setSections((prev) => prev.filter((section) => section._id !== deletedSectionId));
    });

    // Cleanup the socket connection
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="landing-container">
      <h1>Welcome to the Queue Management System</h1>
      <div className="landing-links-container">
        <Link to="/admin" className="landing-link">Admin Panel</Link>
        <Link to="/receptionist" className="landing-link">Receptionist</Link>
        <Link to="/dashboard" className="landing-link">Queue Dashboard</Link>
        
        {sections.length > 0 ? (
          sections.map((section) => (
            <Link 
              key={section._id} 
              to={`/section/${section.name}`} 
              className="landing-link"
            >
              {section.name}
            </Link>
          ))
        ) : (
          <p>No sections available.</p>
        )}
      </div>
    </div>
  );
};

export default LandingPage;