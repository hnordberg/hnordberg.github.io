import Image from 'next/image';
import './style.css'

const ContactPage = () => {
  return (
    <main>
      <h1>Contact</h1>
      <div className="contact-container">
        <Image src='/img/henrik.avatar.2024.jpeg' width="100" height="100" alt="Photo of Henrik Nordberg" title="Photo of Henrik Nordberg" />
        <div className="contact-details">
          hnordberg@apache.org<br />
          <a href='https://linkedin.com/in/hnordberg'>linkedin.com/in/hnordberg</a>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
