import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './Section.css';


const socket = io.connect("http://localhost:5000");

const Section = () => {
  const { section } = useParams(); // Get the section name from the URL
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Fetch the queue for the specific section dynamically
    const fetchQueue = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/queue/${section}`);
        setQueue(res.data);
      } catch (err) {
        console.error('Error fetching queue:', err);
      }
    };

    fetchQueue();
  }, [section]);

  const handleFinish = (id) => {
    // Delete the customer from the queue
    axios.delete(`http://localhost:5000/queue/${id}`).then(() => {
      socket.emit('queue-updated', { section });
      setQueue(queue.filter(item => item._id !== id)); // Remove customer from local queue
    });
  };

  useEffect(() => {
    // Listen for queue updates through socket.io
    socket.on('queue-updated', ({ section: updatedSection }) => {
      if (updatedSection === section) {
        axios.get(`http://localhost:5000/queue/${section}`).then(res => setQueue(res.data));
      }
    });

    // Listen for section deletion event
    socket.on('sectionDeleted', (sectionId) => {
      if (sectionId === section) {
        // Handle the section being deleted (e.g., redirect or show a message)
        alert(`The section "${section}" has been deleted.`);
      }
    });

    // Listen for section update event
    socket.on('sectionUpdated', (updatedSection) => {
      if (updatedSection.name === section) {
        // Handle the section being updated (e.g., update UI, fetch updated queue)
        alert(`The section "${section}" has been updated.`);
        axios.get(`http://localhost:5000/queue/${section}`).then(res => setQueue(res.data));
      }
    });

    // Clean up socket listeners on component unmount
    return () => {
      socket.off('queue-updated');
      socket.off('sectionDeleted');
      socket.off('sectionUpdated');
    };
  }, [section, queue]);

  return (
    <div className="section-container">
      <h1 className="section-heading">{section} Section</h1>
      <h2 className="queue-heading">Queue</h2>
      <ul>
        {queue.length > 0 ? (
          queue.map((item, index) => (
            <li key={item._id} style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
              {item.membershipNumber} (Position: {item.position})
              {index === 0 && (
                <button onClick={() => handleFinish(item._id)}>Finish Service</button>
              )}
            </li>
          ))
        ) : (
          <li>No customers in the queue for {section}.</li>
        )}
      </ul>
    </div>
  );
};

export default Section;