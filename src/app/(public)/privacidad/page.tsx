import type { Metadata } from "next";
import { LegalDocumentPage, LegalSection } from "@/components/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Privacy Policy for FIDECOOP and its sites and programs.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      description="This Policy governs the collection, use, storage, disclosure, and protection of information obtained through FIDECOOP sites, forms, portals, programs, and activities."
      lastUpdated="JULY, 2026"
    >
      <LegalSection title="1. Identity of the Data Controller">
        <p>
          The Sites are owned and operated by FONDO DE INVERSIÓN Y DESARROLLO COOPERATIVO, INC. (FIDECOOP),
          400 Ave. Américo Miranda, Suite 302, San Juan, Puerto Rico 00927-5142. Contact: info@fidecoop.coop.
        </p>
        <p>
          FIDECOOP may administer the Sites directly or through affiliated programs, contractors, consultants,
          technology providers, authorized subrecipients, or other collaborating entities.
        </p>
      </LegalSection>

      <LegalSection title="2. Scope of This Policy">
        <ul>
          <li>Visitors to the Sites.</li>
          <li>Individuals who communicate with FIDECOOP by electronic forms, email, telephone, social media, or similar means.</li>
          <li>Participants, applicants, beneficiaries, representatives, officers, directors, employees, members, consultants, and collaborators of cooperatives.</li>
          <li>Individuals seeking admission to programs administered by FIDECOOP.</li>
          <li>Applicants for financing, grants, mentorship, incubation, acceleration, technical assistance, or related services.</li>
          <li>Users who submit documents or information through physical or electronic forms.</li>
          <li>Participants in programs funded with federal, state, municipal, or private funds.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Bases for the Collection and Use of Information">
        <p>FIDECOOP collects and processes information on the basis of one or more of the following grounds:</p>
        <ul>
          <li>User consent.</li>
          <li>The user&apos;s express request.</li>
          <li>Administration of programs or services.</li>
          <li>Eligibility determinations.</li>
          <li>Compliance with contractual obligations.</li>
          <li>Compliance with legal or regulatory obligations.</li>
          <li>Administration of grants and public funds.</li>
          <li>Protection of FIDECOOP&apos;s legitimate interests.</li>
          <li>Fraud prevention and site security.</li>
          <li>The public interest and audit or oversight requirements.</li>
        </ul>
        <p>Where consent is required by law, the user grants it by voluntarily submitting information through the Sites or related forms.</p>
      </LegalSection>

      <LegalSection title="4. Information We Collect">
        <p>Depending on the program or service, FIDECOOP may collect personal, corporate, financial, technical, and operational information.</p>

        <h3 className="text-base font-semibold text-verde-impulso">Identification Information</h3>
        <ul>
          <li>First name and last name(s).</li>
          <li>Date of birth and gender.</li>
          <li>Photographs, official identification, and signatures.</li>
          <li>Last four digits of the Social Security Number.</li>
          <li>Biographical information.</li>
        </ul>

        <h3 className="text-base font-semibold text-verde-impulso">Contact Information</h3>
        <ul>
          <li>Physical and mailing addresses.</li>
          <li>Email addresses and telephone numbers.</li>
          <li>Municipality and emergency contact information.</li>
        </ul>

        <h3 className="text-base font-semibold text-verde-impulso">Corporate Information</h3>
        <ul>
          <li>Legal name and trade name of the cooperative.</li>
          <li>EIN, incorporation date, organizational structure, member information, and board or management information.</li>
          <li>Certifications, licenses, permits, and corporate resolutions.</li>
        </ul>

        <h3 className="text-base font-semibold text-verde-impulso">Educational and Employment Information</h3>
        <ul>
          <li>Educational history, professional experience, employment history, certifications, and positions held.</li>
        </ul>

        <h3 className="text-base font-semibold text-verde-impulso">Financial Information</h3>
        <ul>
          <li>Financial statements, projections, budgets, banking information, business references, credit applications, and financing or grant-related information.</li>
        </ul>

        <h3 className="text-base font-semibold text-verde-impulso">Program Information</h3>
        <ul>
          <li>Intake proposals, business plans, feasibility studies, compliance documents, performance metrics, eligibility information, and subsidized-program data.</li>
        </ul>

        <h3 className="text-base font-semibold text-verde-impulso">Technical Information</h3>
        <ul>
          <li>IP address, browser type, device type, operating system, approximate location, date and time of access, pages visited, content interactions, activity logs, cookies, and similar technologies.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Consent">
        <p>By providing information to FIDECOOP, you represent and warrant that you have authority to provide it, that it is true and complete, that you may disclose third-party information where applicable, and that you authorize FIDECOOP to use, store, analyze, verify, and share the information for the purposes described in this Policy.</p>
      </LegalSection>

      <LegalSection title="6. Subsidized Programs and Government Compliance">
        <p>
          Programs funded in whole or in part through federal, state, or municipal funds, including CDBG-DR,
          PRDOH, HUD, or other entities, may use collected information to determine eligibility, validate compliance,
          verify information, document outcomes, administer public funds, prepare reports, monitor performance,
          conduct audits or inspections, investigate irregularities, and protect public funds.
        </p>
      </LegalSection>

      <LegalSection title="7. Disclosure and Sharing of Information">
        <p>FIDECOOP may share information when reasonably necessary to fulfill the purposes described in this Policy, including with affiliated programs, government agencies, municipalities, regulatory bodies, funding entities, subrecipients, auditors, consultants, contractors, advisors, evaluators, selection committees, technology providers, financial institutions, fraud investigators, judicial or administrative authorities, and other entities involved in program oversight.</p>
      </LegalSection>

      <LegalSection title="8. Verification of Information and Due Diligence">
        <p>FIDECOOP may verify, corroborate, validate, investigate, and evaluate submitted information. It may request documentation, clarifications, interviews, references, public records, legally available databases, and other supporting evidence. Refusal to provide reasonably required information may lead to suspension, denial, termination, or other lawful action.</p>
      </LegalSection>

      <LegalSection title="9. Retention of Information and Records">
        <p>FIDECOOP may retain information, records, communications, and files for as long as reasonably necessary to fulfill the Policy, contractual and legal obligations, grant and audit requirements, investigations, disputes, legal rights, institutional interests, and recordkeeping duties. Publicly funded programs may require extended or indefinite retention.</p>
      </LegalSection>

      <LegalSection title="10. User Rights">
        <p>Subject to legal, regulatory, contractual, grant, audit, and legitimate-interest limitations, users may request access, correction, updating, clarification, or revocation of certain consents where legally possible. Requests may be denied when retention is legally required, the information is needed for audits or investigations, third-party rights would be affected, or another valid legal basis applies.</p>
      </LegalSection>

      <LegalSection title="11. Information Security">
        <p>FIDECOOP implements reasonable administrative, organizational, physical, and technological measures, including access controls, authentication, secure storage, monitoring, internal controls, staff training, and handling procedures. No system can guarantee absolute security, and FIDECOOP does not warrant that the Sites are immune from unauthorized access, errors, interruptions, loss, cyberattacks, or similar events.</p>
      </LegalSection>

      <LegalSection title="12. Electronic Transmissions and Electronic Signature">
        <p>By using the Sites, users consent to electronic communications and acknowledge that electronic records and signatures may have legal validity where permitted by law, including the E-SIGN Act and applicable Puerto Rico law.</p>
      </LegalSection>

      <LegalSection title="13. Confidential Information, Business Plans, and Proposals">
        <p>Unless a written confidentiality agreement signed by an authorized FIDECOOP representative provides otherwise, the mere submission of applications, forms, proposals, ideas, concepts, business models, projects, plans, documents, materials, strategic information, or commercial or financial information does not create a fiduciary relationship or additional confidentiality obligation beyond applicable legal duties. The Policy does not assign intellectual property rights to FIDECOOP, nor require FIDECOOP to adopt or fund any proposal.</p>
      </LegalSection>

      <LegalSection title="14. Photographs, Testimonials, and Audiovisual Material">
        <p>The Sites may include photographs, videos, audio recordings, testimonials, and other audiovisual material relating to FIDECOOP activities and affiliated programs. Unless law requires otherwise, such material may be used on the Sites, social media, publications, educational and promotional materials, management reports, reports to funding or government entities, historical documentation, and cooperative-development activities.</p>
      </LegalSection>

      <LegalSection title="15. Directories, ExpoCoop, and Third-Party Content">
        <p>The Sites may include directories, institutional profiles, informational materials, and content relating to third parties. Such information may originate from cooperatives, public sources, collaborating entities, or third parties. FIDECOOP does not warrant that it is complete, accurate, current, or error-free, and users are responsible for verifying information before relying on it.</p>
      </LegalSection>

      <LegalSection title="16. Third-Party Logos, Trademarks, and Intellectual Property">
        <p>The Sites may include trade names, logos, designs, photographs, and other intellectual property owned by third parties. Unless expressly stated otherwise, those rights remain with their owners, and inclusion on the Sites does not imply affiliation, sponsorship, endorsement, approval, representation, or commercial relationship with FIDECOOP.</p>
      </LegalSection>

      <LegalSection title="17. Technology Platforms and Third-Party Providers">
        <p>The Sites and programs may use third-party services for storage, transmission, analytics, virtual education, forms, videoconferencing, document management, hosting, security, email, and other operations, including providers such as Webflow, Microsoft, SharePoint, Microsoft Forms, Google, Google Drive, Google Forms, Zoom, and TalentLMS. Information may be stored or processed outside Puerto Rico.</p>
      </LegalSection>

      <LegalSection title="18. Artificial Intelligence and Automated Analysis">
        <p>FIDECOOP may use automation, machine learning, artificial intelligence, or similar technologies to support administrative, educational, statistical, operational, or service functions, while retaining human review when needed for the nature of the program or decision.</p>
      </LegalSection>

      <LegalSection title="19. Fraud Prevention and Protection of Public Funds">
        <p>FIDECOOP maintains a zero-tolerance policy toward fraud, false statements, omission of material information, altered documents, unauthorized use of third-party credentials, and similar conduct. False or fraudulent submissions may result in denial, suspension, termination, recovery of funds, disqualification, referrals, and other remedies. FIDECOOP may disclose relevant information to agencies and authorities as needed to prevent, detect, investigate, or prosecute fraud or misuse of public funds.</p>
      </LegalSection>

      <LegalSection title="20. Minors">
        <p>FIDECOOP does not knowingly collect personal information from minors without the authorization or legal representation required by law. If such information is received, FIDECOOP may delete it and restrict or cancel access to the corresponding Sites, services, programs, or platforms. Parents or guardians may contact FIDECOOP to request review or deletion subject to legal requirements.</p>
      </LegalSection>

      <LegalSection title="21. Changes to This Policy">
        <p>FIDECOOP may amend this Policy at any time. Changes take effect when published on the Sites unless stated otherwise. Continued use of the Sites after publication constitutes acceptance of the changes.</p>
      </LegalSection>

      <LegalSection title="22. Reservation of Rights">
        <p>Nothing in this Policy limits or waives any right, immunity, defense, privilege, or remedy available to FIDECOOP under applicable laws, regulations, contracts, grant agreements, or other provisions.</p>
      </LegalSection>

      <LegalSection title="23. Governing Law and Jurisdiction">
        <p>This Policy is governed by the laws of the Commonwealth of Puerto Rico and applicable federal laws of the United States. Any dispute relating to the Policy or the Sites is subject to the exclusive jurisdiction of the competent courts located in Puerto Rico, unless applicable federal law provides otherwise.</p>
      </LegalSection>

      <LegalSection title="24. Contact">
        <p>
          Questions about this Policy may be directed to FONDO DE INVERSIÓN Y DESARROLLO COOPERATIVO, INC.
          (FIDECOOP), 400 Ave. Américo Miranda, Suite 302, San Juan, Puerto Rico 00927-5142, or by email at
          info@fidecoop.coop.
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
