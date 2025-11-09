import React, { useState } from 'react';
import Sidbar from './partials/Sidbar';
import Topnav from './partials/Topnav';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaPaperPlane, FaUser, FaCommentDots,
  FaGithub, FaTwitter, FaLinkedin, FaInstagram
} from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FaEnvelope className="text-2xl" />,
      title: 'Email',
      content: 'support@moviehub.com',
      link: 'mailto:support@moviehub.com'
    },
    {
      icon: <FaPhone className="text-2xl" />,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: 'Address',
      content: '123 Movie Street, Hollywood, CA 90028',
      link: null
    }
  ];

  const socialLinks = [
    { icon: <FaGithub />, name: 'GitHub', link: '#' },
    { icon: <FaTwitter />, name: 'Twitter', link: '#' },
    { icon: <FaLinkedin />, name: 'LinkedIn', link: '#' },
    { icon: <FaInstagram />, name: 'Instagram', link: '#' }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-950 overflow-hidden">
      <Sidbar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topnav />
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0d0917] to-[#1a1125] text-white p-4 md:p-8">
          
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-[#6556CD] to-[#9b8aff] p-3 rounded-xl">
              <FaCommentDots className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Contact Us</h1>
              <p className="text-zinc-400 text-sm">We'd love to hear from you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-6 md:p-8 border border-[#6556CD]/20">
                <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-zinc-300 mb-2 text-sm" htmlFor="name">
                        <FaUser className="inline mr-2" />
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 mb-2 text-sm" htmlFor="email">
                        <FaEnvelope className="inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none transition-all"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-zinc-300 mb-2 text-sm" htmlFor="subject">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none transition-all"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-zinc-300 mb-2 text-sm" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      className="w-full px-4 py-3 bg-[#0d0917] text-white rounded-lg border border-[#6556CD]/30 focus:border-[#6556CD] focus:outline-none transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#6556CD] to-[#9b8aff] hover:from-[#7561e0] hover:to-[#a896ff] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              
              {/* Contact Information Cards */}
              {contactInfo.map((info, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-6 border border-[#6556CD]/20"
                >
                  <div className="text-[#6556CD] mb-3">{info.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{info.title}</h3>
                  {info.link ? (
                    <a 
                      href={info.link}
                      className="text-zinc-400 hover:text-[#6556CD] transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-zinc-400">{info.content}</p>
                  )}
                </div>
              ))}

              {/* Social Media */}
              <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-6 border border-[#6556CD]/20">
                <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      className="w-12 h-12 bg-[#0d0917] rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#6556CD] transition-all duration-300 border border-[#6556CD]/30"
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gradient-to-br from-[#1e1830] to-[#2a1f40] rounded-xl p-6 border border-[#6556CD]/20">
                <h3 className="text-lg font-bold text-white mb-4">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Monday - Friday</span>
                    <span className="text-white">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Saturday</span>
                    <span className="text-white">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Sunday</span>
                    <span className="text-white">Closed</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
