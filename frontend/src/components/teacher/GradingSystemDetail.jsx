import React from 'react';
import useGradingSystemStore from '../../store/teacherGradeStore';

export default function GradingSystemDetail({ gradingSystem, onBack }) {
  return (
    <div className="card p-6 max-w-2xl mx-auto">
      <button className="btn btn-secondary mb-4" onClick={onBack}>← Back</button>
      <h2 className="text-2xl font-bold mb-2">{gradingSystem.name}</h2>
      <p className="mb-4">{gradingSystem.description}</p>
      <h3 className="font-semibold mb-2">Grade Ranges</h3>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th>Lower</th>
            <th>Upper</th>
            <th>Grade</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {gradingSystem.grade_ranges.map((gr, idx) => (
            <tr key={idx}>
              <td>{gr.lower_limit}</td>
              <td>{gr.upper_limit}</td>
              <td>{gr.grade}</td>
              <td>{gr.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add more actions here if needed */}
    </div>
  );
}