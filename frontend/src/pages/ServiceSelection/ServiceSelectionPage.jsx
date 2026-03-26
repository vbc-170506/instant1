// ============================================================
// FILE 1: src/pages/ServiceSelection/ServiceSelectionPage.jsx
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceSelectionPage.css';
import { requestsAPI } from '../../services/api';

const SERVICE_DATA = {
  skilled: {
    id: 'skilled',
    title: 'Skilled Workers',
    tagline: 'Certified Professionals',
    description: 'Trained experts with certifications requiring technical knowledge and hands-on expertise.',
    icon: '⚙️',
    gradient: 'card-gradient-skilled',
    accent: '#FF6B35',
    preview: ['Electricians', 'Welders', 'CNC Operators'],
    services: [
      'Electricians',
      'Welders (Arc, MIG, TIG)',
      'Fitters',
      'CNC Machine Operators',
      'Lathe Machine Operators',
      'HVAC Technicians',
      'Plumbers',
      'Industrial Mechanics',
      'Fabricators',
      'Tool & Die Makers',
    ],
  },
  'semi-skilled': {
    id: 'semi-skilled',
    title: 'Semi-Skilled Workers',
    tagline: 'Operational Experience',
    description: 'Workers with basic experience and operational knowledge, ready to perform structured tasks.',
    icon: '🔧',
    gradient: 'card-gradient-semi',
    accent: '#3B82F6',
    preview: ['Machine Helpers', 'Packing Staff', 'Warehouse Assistants'],
    services: [
      'Machine Helpers',
      'Factory Helpers',
      'Packing Staff',
      'Assembly Line Workers',
      'Warehouse Assistants',
      'Construction Helpers',
      'Loading/Unloading Supervisors',
      'Delivery Assistants',
      'Maintenance Helpers',
    ],
  },
  unskilled: {
    id: 'unskilled',
    title: 'Unskilled Workers',
    tagline: 'No Experience Required',
    description: 'General workforce requiring no prior experience — ideal for physical, repetitive, or support tasks.',
    icon: '👷',
    gradient: 'card-gradient-unskilled',
    accent: '#10B981',
    preview: ['General Labor', 'Cleaning Staff', 'Loaders & Unloaders'],
    services: [
      'General Labor',
      'Loaders / Unloaders',
      'Cleaning Staff',
      'Movers & Packers',
      'Helpers (General)',
      'Waste Handling Workers',
      'Site Cleaning Workers',
    ],
  },
};

// ─── Service Selection Page ───────────────────────────────────
export const ServiceSelectionPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleSelect = (serviceType) => {
    navigate(`/services/${serviceType}`);
  };

  return (
    <div className="ssp-root">
      {/* Background decorations */}
      <div className="ssp-bg-orb ssp-bg-orb-1" />
      <div className="ssp-bg-orb ssp-bg-orb-2" />
      <div className="ssp-bg-orb ssp-bg-orb-3" />

      <div className="ssp-container">
        {/* Header */}
        <div className="ssp-header">
          <div className="ssp-badge">
            <span className="ssp-badge-dot" />
            Instant Workforce Platform
          </div>
          <h1 className="ssp-title">
            Hire Workforce
            <span className="ssp-title-accent"> Instantly</span>
          </h1>
          <p className="ssp-subtitle">
            Choose the type of workers you need — from certified professionals to general helpers
          </p>
        </div>

        {/* Cards Grid */}
        <div className="ssp-grid">
          {Object.values(SERVICE_DATA).map((category, index) => (
            <div
              key={category.id}
              className={`ssp-card ${category.gradient} ${hoveredCard === category.id ? 'ssp-card-hovered' : ''}`}
              style={{ animationDelay: `${index * 0.12}s` }}
              onMouseEnter={() => setHoveredCard(category.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleSelect(category.id)}
            >
              {/* Card glow effect */}
              <div className="ssp-card-glow" style={{ '--accent': category.accent }} />

              {/* Icon */}
              <div className="ssp-card-icon-wrap">
                <span className="ssp-card-icon">{category.icon}</span>
                <div className="ssp-card-icon-ring" style={{ borderColor: category.accent }} />
              </div>

              {/* Content */}
              <div className="ssp-card-body">
                <span className="ssp-card-tagline" style={{ color: category.accent }}>
                  {category.tagline}
                </span>
                <h2 className="ssp-card-title">{category.title}</h2>
                <p className="ssp-card-desc">{category.description}</p>

                {/* Preview list */}
                <ul className="ssp-card-preview">
                  {category.preview.map((item) => (
                    <li key={item} className="ssp-card-preview-item">
                      <span className="ssp-card-preview-dot" style={{ background: category.accent }} />
                      {item}
                    </li>
                  ))}
                  <li className="ssp-card-preview-item ssp-card-preview-more">
                    +{category.services.length - 3} more services
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <button
                className="ssp-card-btn"
                style={{ '--btn-accent': category.accent }}
                onClick={(e) => { e.stopPropagation(); handleSelect(category.id); }}
              >
                View Services
                <svg className="ssp-card-btn-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Worker count badge */}
              <div className="ssp-card-count">
                <span>{category.services.length} services</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="ssp-footer-note">
          🔒 All workers are verified · 📍 Pan-India availability · ⚡ Deploy within 24 hours
        </p>
      </div>
    </div>
  );
};


// ─── Service List Page ────────────────────────────────────────
export const ServiceListPage = ({ serviceType }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const category = SERVICE_DATA[serviceType];

  if (!category) {
    return (
      <div className="slp-error">
        <p>Invalid service type. <a href="/services">Go back</a></p>
      </div>
    );
  }

  const handleProceed = () => {
    if (!selected) return;
    navigate(`/booking?service_type=${serviceType}&service=${encodeURIComponent(selected)}`);
  };

  return (
    <div className="slp-root">
      <div className="slp-bg-orb" />
      <div className="slp-container">
        {/* Back button */}
        <button className="slp-back" onClick={() => navigate('/services')}>
          ← Back to Categories
        </button>

        {/* Header */}
        <div className="slp-header">
          <span className="slp-header-icon">{category.icon}</span>
          <div>
            <p className="slp-header-tagline" style={{ color: category.accent }}>{category.tagline}</p>
            <h1 className="slp-header-title">{category.title}</h1>
            <p className="slp-header-desc">{category.description}</p>
          </div>
        </div>

        {/* Services grid */}
        <p className="slp-instruction">Select the specific service you need:</p>
        <div className="slp-grid">
          {category.services.map((service, i) => (
            <div
              key={service}
              className={`slp-service-card ${selected === service ? 'slp-service-selected' : ''}`}
              style={{
                animationDelay: `${i * 0.05}s`,
                '--accent': category.accent,
              }}
              onClick={() => setSelected(service)}
            >
              <div className="slp-service-check">
                {selected === service ? '✓' : ''}
              </div>
              <span className="slp-service-name">{service}</span>
            </div>
          ))}
        </div>

        {/* Proceed button */}
        <div className="slp-proceed-wrap">
          <button
            className={`slp-proceed-btn ${selected ? 'slp-proceed-active' : ''}`}
            style={{ '--accent': category.accent }}
            onClick={handleProceed}
            disabled={!selected}
          >
            {selected ? `Proceed with "${selected}" →` : 'Select a service to continue'}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── Booking Form Page ────────────────────────────────────────
export const BookingFormPage = ({ serviceType, service }) => {
  const navigate = useNavigate();
  const category = SERVICE_DATA[serviceType];
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    service_type: serviceType || '',
    service: service || '',
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    location: '',
    workers_needed: '',
    start_date: '',
    duration: '',
    shift: '',
    notes: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const [error, setError] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  try {
    // Map booking form fields to your existing ServiceRequest model
    await requestsAPI.create({
      title: `${form.service} - ${form.company_name}`,
      description: `
Service: ${form.service}
Category: ${form.service_type}
Workers Needed: ${form.workers_needed}
Shift: ${form.shift}
Duration: ${form.duration}
Location: ${form.location}
Notes: ${form.notes}
      `.trim(),
      budget: 0,            // user can update after posting
      deadline: form.start_date,
      category: form.service,
      location: form.location,
    });
    setSubmitted(true);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to submit. Please try again.');
  }
};

  if (submitted) {
    return (
      <div className="bfp-success">
        <div className="bfp-success-card">
          <div className="bfp-success-icon">✅</div>
          <h2>Booking Received!</h2>
          <p>We'll contact you within <strong>2 hours</strong> to confirm your workforce deployment.</p>
          <div className="bfp-success-details">
            <span><b>Category:</b> {form.service_type}</span>
            <span><b>Service:</b> {form.service}</span>
            <span><b>Company:</b> {form.company_name}</span>
          </div>
          <button className="bfp-success-btn" onClick={() => navigate('/services')}>
            Book More Workers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bfp-root">
      <div className="bfp-container">
        {/* Back */}
        <button className="slp-back" onClick={() => navigate(`/services/${serviceType}`)}>
          ← Back to Services
        </button>

        <div className="bfp-layout">
          {/* Summary panel */}
          <div className="bfp-summary">
            <div className="bfp-summary-inner" style={{ '--accent': category?.accent || '#3B82F6' }}>
              <p className="bfp-summary-label">Booking For</p>
              <h2 className="bfp-summary-title">{form.service || 'Service'}</h2>
              <div className="bfp-summary-tag">{category?.title || serviceType}</div>
              <hr className="bfp-summary-divider" />
              <ul className="bfp-summary-checklist">
                <li>✓ Pan-India deployment</li>
                <li>✓ Background verified workers</li>
                <li>✓ Replacement guarantee</li>
                <li>✓ 24-hour deployment</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="bfp-form-wrap">
            <h1 className="bfp-form-title">Complete Your Booking</h1>
            <p className="bfp-form-subtitle">Fill in your requirements and we'll get back to you within 2 hours.</p>

            <form onSubmit={handleSubmit} className="bfp-form">
              {/* Auto-filled locked fields */}
              <div className="bfp-field-row">
                <div className="bfp-field">
                  <label className="bfp-label">Worker Category</label>
                  <input className="bfp-input bfp-input-locked" value={category?.title || serviceType} readOnly />
                </div>
                <div className="bfp-field">
                  <label className="bfp-label">Selected Service</label>
                  <input className="bfp-input bfp-input-locked" value={form.service} readOnly />
                </div>
              </div>

              <div className="bfp-field-row">
                <div className="bfp-field">
                  <label className="bfp-label">Company Name *</label>
                  <input className="bfp-input" name="company_name" value={form.company_name}
                    onChange={handleChange} required placeholder="ABC Manufacturing Pvt Ltd" />
                </div>
                <div className="bfp-field">
                  <label className="bfp-label">Contact Person *</label>
                  <input className="bfp-input" name="contact_name" value={form.contact_name}
                    onChange={handleChange} required placeholder="Rajesh Kumar" />
                </div>
              </div>

              <div className="bfp-field-row">
                <div className="bfp-field">
                  <label className="bfp-label">Phone Number *</label>
                  <input className="bfp-input" name="phone" type="tel" value={form.phone}
                    onChange={handleChange} required placeholder="+91 98765 43210" />
                </div>
                <div className="bfp-field">
                  <label className="bfp-label">Email Address *</label>
                  <input className="bfp-input" name="email" type="email" value={form.email}
                    onChange={handleChange} required placeholder="hr@company.com" />
                </div>
              </div>

              <div className="bfp-field">
                <label className="bfp-label">Work Location *</label>
                <input className="bfp-input" name="location" value={form.location}
                  onChange={handleChange} required placeholder="Mumbai, Maharashtra" />
              </div>

              <div className="bfp-field-row">
                <div className="bfp-field">
                  <label className="bfp-label">Number of Workers *</label>
                  <input className="bfp-input" name="workers_needed" type="number" min="1"
                    value={form.workers_needed} onChange={handleChange} required placeholder="5" />
                </div>
                <div className="bfp-field">
                  <label className="bfp-label">Start Date *</label>
                  <input className="bfp-input" name="start_date" type="date"
                    value={form.start_date} onChange={handleChange} required
                    min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="bfp-field-row">
                <div className="bfp-field">
                  <label className="bfp-label">Duration</label>
                  <select className="bfp-input" name="duration" value={form.duration} onChange={handleChange}>
                    <option value="">Select duration</option>
                    <option value="1_week">1 Week</option>
                    <option value="2_weeks">2 Weeks</option>
                    <option value="1_month">1 Month</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
                <div className="bfp-field">
                  <label className="bfp-label">Shift Preference</label>
                  <select className="bfp-input" name="shift" value={form.shift} onChange={handleChange}>
                    <option value="">Select shift</option>
                    <option value="morning">Morning (6AM–2PM)</option>
                    <option value="afternoon">Afternoon (2PM–10PM)</option>
                    <option value="night">Night (10PM–6AM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="bfp-field">
                <label className="bfp-label">Additional Notes</label>
                <textarea className="bfp-input bfp-textarea" name="notes" value={form.notes}
                  onChange={handleChange} rows={3}
                  placeholder="Any specific requirements, certifications needed, tools to bring, etc." />
              </div>
                {error && (
                    <div className="bfp-error">
                        {error}
                    </div>
                    )}
              <button type="submit" className="bfp-submit-btn"
                style={{ '--accent': category?.accent || '#3B82F6' }}>
                Submit Booking Request ⚡
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionPage;