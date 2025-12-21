import React, { useState } from 'react';
import useGradingSystemStore from '../../store/teacherGradeStore';

export default function AddGradingSystem({ onCancel }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [ranges, setRanges] = useState([
    { lower_limit: '', upper_limit: '', grade: '', description: '' },
  ]);
  const { addGradingSystem, loading, error } = useGradingSystemStore();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRangeChange = (idx, e) => {
    const newRanges = [...ranges];
    newRanges[idx][e.target.name] = e.target.value;
    setRanges(newRanges);
  };

  const addRange = () => setRanges([...ranges, { lower_limit: '', upper_limit: '', grade: '', description: '' }]);
  const removeRange = (idx) => setRanges(ranges.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addGradingSystem({ ...form, grade_ranges: ranges });
    onCancel();
  };

  return (
    <div className="card p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Grading System</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <textarea
          className="input"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <div>
          <h3 className="font-semibold mb-2">Grade Ranges</h3>
          {ranges.map((range, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input className="input" name="lower_limit" type="number" placeholder="Lower" value={range.lower_limit} onChange={e => handleRangeChange(idx, e)} required />
              <input className="input" name="upper_limit" type="number" placeholder="Upper" value={range.upper_limit} onChange={e => handleRangeChange(idx, e)} required />
              <input className="input" name="grade" placeholder="Grade" value={range.grade} onChange={e => handleRangeChange(idx, e)} required />
              <input className="input" name="description" placeholder="Description" value={range.description} onChange={e => handleRangeChange(idx, e)} />
              <button type="button" onClick={() => removeRange(idx)} className="btn btn-danger">×</button>
            </div>
          ))}
          <button type="button" onClick={addRange} className="btn btn-secondary">Add Range</button>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>Save</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}