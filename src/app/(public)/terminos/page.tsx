import type { Metadata } from "next";
import { LegalDocumentPage, LegalSection } from "@/components/LegalDocumentPage";

export const metadata: Metadata = {
  title: "Términos",
  description: "Terms and Conditions of Use for FIDECOOP and its sites and programs.",
};

export default function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms and Conditions of Use"
      description="These Terms govern access to and use of FIDECOOP sites, microsites, forms, portals, directories, trainings, events, applications, programs, and related services."
      lastUpdated="JULY, 2026"
    >
      <LegalSection title="1. Operator of the Sites">
        <p>The Sites are owned and operated by FONDO DE INVERSIÓN Y DESARROLLO COOPERATIVO, INC. (FIDECOOP), 400 Ave. Américo Miranda, Suite 302, San Juan, Puerto Rico 00927-5142. Contact: info@fidecoop.coop.</p>
      </LegalSection>

      <LegalSection title="2. Purpose of the Sites">
        <p>The Sites serve informational, educational, institutional, administrative, promotional, and operational purposes related to cooperative development, technical assistance, incubation, acceleration, financing, training, cooperative directories, and other FIDECOOP initiatives. The information published on the Sites does not constitute legal, financial, tax, accounting, investment, or business advice, and it is not a binding offer or a guarantee of admission, grant, credit, mentorship, technical assistance, or participation in any program.</p>
      </LegalSection>

      <LegalSection title="3. Eligibility and Authority">
        <p>The Sites are intended for individuals with legal capacity and for legally constituted entities. Accessing or using the Sites, or submitting information on one&apos;s own behalf or on behalf of a third party, represents that the user has the capacity and authorizations to do so.</p>
        <ul>
          <li>The user has the legal capacity required or is duly authorized by a lawful representative.</li>
          <li>The user has authority to act on behalf of the person, cooperative, organization, or entity represented.</li>
          <li>All submitted information is true, correct, complete, current, and not misleading.</li>
          <li>The user will not submit false, altered, incomplete, or fraudulent information.</li>
          <li>The user has the authorizations, consents, permits, and rights needed to submit the information.</li>
          <li>The user will comply with the legal, regulatory, and programmatic requirements that apply.</li>
        </ul>
        <p>Breach of these representations may result in denial, suspension, termination, cancellation, recovery of funds, or other legal action available under applicable law.</p>
      </LegalSection>

      <LegalSection title="4. Programs, Applications, and Evaluations">
        <p>FIDECOOP may administer incubation, acceleration, mentorship, training, technical assistance, cooperative development, grant, financing, credit facility, directory, event, and other service programs. Submitting forms or supporting materials does not guarantee admission, selection, financing, credit, a grant, disbursement, participation, continuity, or any particular outcome. FIDECOOP may accept, reject, suspend, discontinue, modify, or condition applications and programs based on its criteria, funds, requirements, priorities, and legal or contractual obligations.</p>
      </LegalSection>

      <LegalSection title="5. Responsibility for Submitted Information">
        <p>Each user is responsible for the accuracy, completeness, legality, and currency of submitted information. FIDECOOP may request additional information, clarifications, supporting documents, or certifications whenever necessary. Failure to cooperate or omitting material information may result in suspension, denial, or termination.</p>
      </LegalSection>

      <LegalSection title="6. Verification, Monitoring, and Audit">
        <p>FIDECOOP may verify, corroborate, validate, analyze, and evaluate submitted information, documents, and data through supporting documents, public records, databases, references, financial institutions, service providers, contractors, auditors, consultants, government agencies, funding entities, and any other legitimate source. Users acknowledge that materials may be subject to review, monitoring, verification, audit, oversight, investigation, inspection, or evaluation by FIDECOOP, its representatives, funding entities, PRDOH, HUD, other agencies, auditors, oversight bodies, or competent authorities. Users must retain and make available program records for the required term.</p>
      </LegalSection>

      <LegalSection title="7. Programs Funded With Public Funds">
        <p>Some programs may be funded with federal, state, municipal, or private funds, including PRDOH, HUD, and CDBG-DR programs. Submitted information may be used, analyzed, shared, and retained to determine eligibility, document compliance, verify certifications, justify disbursements, administer grants and public funds, monitor performance, prepare reports, respond to monitoring or audits, prevent fraud or misuse, and comply with legal and disclosure obligations. Information may be shared where necessary or permitted by law with agencies, funding entities, auditors, contractors, subrecipients, oversight bodies, and other authorized third parties.</p>
      </LegalSection>

      <LegalSection title="8. False Statements, Fraud, and Recovery of Funds">
        <p>False, misleading, incomplete, altered, fraudulent, or materially inaccurate information, as well as omissions relevant to eligibility or compliance, may result in denial, disqualification, suspension, termination, cancellation, recovery of funds, corrective measures, referrals, and other lawful remedies. FIDECOOP may refer information to funding entities, government agencies, oversight bodies, auditors, or competent authorities when necessary. Applicable laws may include 18 U.S.C. § 287, 18 U.S.C. § 1001, and 31 U.S.C. §§ 3729-3733.</p>
      </LegalSection>

      <LegalSection title="9. Privacy">
        <p>Use of the Sites is also subject to FIDECOOP&apos;s Privacy Policy, which explains how user information is collected, used, shared, retained, and protected. If there is a conflict about handling personal information, the Privacy Policy governs that handling unless these Terms impose additional obligations allowed by law.</p>
      </LegalSection>

      <LegalSection title="10. Electronic Communications and Electronic Signatures">
        <p>By using the Sites, submitting forms, or participating in programs, users agree to receive electronic communications related to applications, programs, events, notices, requirements, updates, documents, and administrative matters. Where permitted by law, electronic records, consents, certifications, and signatures have the same validity as paper documents or handwritten signatures.</p>
      </LegalSection>

      <LegalSection title="11. FIDECOOP's Intellectual Property">
        <p>All content created, developed, published, licensed, or made available by FIDECOOP through the Sites, including text, designs, interfaces, graphics, educational material, documents, photographs, images, illustrations, audio, video, software, code, databases, compilations, forms, templates, reports, studies, publications, trademarks, trade names, logos, slogans, and other content, is protected by applicable intellectual property laws. Unless expressly authorized in writing, no user acquires rights in that content merely by accessing the Sites, and copying, reproducing, storing, distributing, modifying, reverse engineering, or commercially exploiting it is prohibited except as allowed by law.</p>
      </LegalSection>

      <LegalSection title="12. User-Submitted Content">
        <p>By submitting content through the Sites, users represent that they own or control the rights needed to submit it and to authorize the uses contemplated by these Terms. Users further represent that the content does not infringe third-party rights. Users grant FIDECOOP a non-exclusive, worldwide, royalty-free, transferable, and sublicensable license, to the extent reasonably necessary, to receive, store, reproduce, review, process, evaluate, administer, verify, archive, audit, monitor, report, disclose when required by law, and use the content in connection with the Sites and related programs. The user remains responsible for third-party claims arising from breaches of these representations and will indemnify FIDECOOP accordingly.</p>
      </LegalSection>

      <LegalSection title="13. Proposals, Ideas, and Business Plans">
        <p>Submitting ideas, concepts, proposals, business plans, business models, projects, studies, or strategic information does not create a fiduciary relationship, partnership, joint venture, agency, representation, or additional confidentiality duty unless a written agreement says otherwise. Submission does not guarantee approval, financing, engagement, award, or participation. Similar projects by different applicants do not by themselves prove misappropriation or infringement, and FIDECOOP may receive or support multiple similar proposals without implying exclusivity or rights over general concepts not protected by law.</p>
      </LegalSection>

      <LegalSection title="14. ExpoCoop, Directories, and Third-Party Content">
        <p>FIDECOOP may include directories, cooperative profiles, virtual exhibits, institutional information, service descriptions, collaboration opportunities, logos, photographs, links, and other content relating to cooperatives, partner organizations, exhibitors, and third parties. The information may come from cooperatives, participating organizations, collaborators, affiliated entities, public sources, or third parties. FIDECOOP will endeavor to keep it reasonably organized but does not warrant accuracy, completeness, availability, or error-free publication. Inclusion does not constitute endorsement or approval.</p>
      </LegalSection>

      <LegalSection title="15. Third-Party Trademarks, Logos, and Rights">
        <p>All trademarks, trade names, logos, emblems, designs, distinctive signs, images, and other third-party materials belong to their respective owners. Their inclusion is for informational, educational, descriptive, promotional, or identification purposes and does not imply affiliation, sponsorship, endorsement, approval, representation, or commercial relationship with FIDECOOP.</p>
      </LegalSection>

      <LegalSection title="16. Photographs, Events, and Audiovisual Material">
        <p>FIDECOOP may document activities, events, trainings, mentorships, meetings, fairs, conferences, graduations, and other institutional initiatives through photographs, audio recordings, videos, or similar means. Participation may be subject to additional authorizations or releases when needed, and handling of audiovisual material is also governed by the applicable Privacy Policy.</p>
      </LegalSection>

      <LegalSection title="17. Third-Party Links">
        <p>The Sites may contain links to pages, platforms, resources, programs, or services operated by third parties. These links are provided to facilitate access to information and opportunities, but FIDECOOP does not control those sites and does not certify or endorse their content, security, privacy practices, or terms. Users should review external policies before providing information.</p>
      </LegalSection>

      <LegalSection title="18. Technology Platforms and Third-Party Services">
        <p>To operate the Sites and administer programs, FIDECOOP may use third-party platforms and technology providers including Webflow, Microsoft, Microsoft 365, SharePoint, Microsoft Forms, Google, Google Forms, Google Drive, Zoom, TalentLMS, email service providers, web hosting, cloud computing, analytics, educational platforms, backup services, document management, authentication, and security services. FIDECOOP seeks providers with appropriate safeguards, but certain infrastructure and processing remain under third-party control.</p>
      </LegalSection>

      <LegalSection title="19. International Data Transfers">
        <p>Information submitted, stored, processed, or generated through the Sites may be transmitted, hosted, backed up, replicated, or accessed by providers located within or outside Puerto Rico or the United States. These transfers may occur for service delivery, hosting, backup, communications, virtual education, document management, support, security, continuity, monitoring, audit, compliance, and program administration. By using the Sites or providing information, users consent to these activities subject to this Policy and applicable law.</p>
      </LegalSection>

      <LegalSection title="20. Limitation of Liability for Third-Party Providers and Breaches">
        <p>FIDECOOP adopts reasonable measures and selects appropriate providers, but no system can guarantee absolute security or uninterrupted availability. To the maximum extent permitted by law, FIDECOOP is not liable for acts or omissions attributable exclusively to external providers or for interruptions, delays, errors, outages, connectivity issues, data corruption, unauthorized access, cyberattacks, infrastructure failures, force majeure, or other events beyond reasonable control, without waiving any non-waivable legal duties.</p>
      </LegalSection>

      <LegalSection title="21. Availability of the Sites">
        <p>FIDECOOP seeks to keep the Sites and digital services reasonably available, but does not warrant uninterrupted, secure, error-free, virus-free, or universally compatible operation. The Sites may experience interruptions or be modified, suspended, restricted, replaced, or discontinued as needed for maintenance, updates, security, infrastructure issues, force majeure, or operational needs. Certain features or programs may depend on funding or regulatory availability.</p>
      </LegalSection>

      <LegalSection title="22. Disclaimer of Warranties">
        <p>The Sites and their content are provided as is and as available. To the maximum extent permitted by law, FIDECOOP disclaims express or implied warranties regarding accuracy, completeness, timeliness, availability, reliability, usefulness, merchantability, fitness for a particular purpose, continuity, compatibility, non-infringement, security, or error-free operation. Users are responsible for protecting their systems, devices, credentials, and backups. Non-excludable rights and obligations remain unaffected.</p>
      </LegalSection>

      <LegalSection title="23. Cooperative Dispute Resolution">
        <p>FIDECOOP promotes fair, transparent, and efficient dispute resolution consistent with cooperative principles. Before initiating judicial proceedings, the parties will make reasonable efforts to resolve disputes through dialogue and cooperation.</p>
        <h3 className="text-base font-semibold text-verde-impulso">a. Notice and Good-Faith Dialogue</h3>
        <p>The complaining party must provide written notice describing the facts, situation, and requested remedy. The parties will then attempt good-faith dialogue within a reasonable period.</p>
        <h3 className="text-base font-semibold text-verde-impulso">b. Voluntary Mediation</h3>
        <p>If direct communication fails, the parties may agree to mediation before a neutral mediator or another recognized mediation mechanism.</p>
        <h3 className="text-base font-semibold text-verde-impulso">c. Other Dispute Resolution Mechanisms</h3>
        <p>Where appropriate and allowed by law, the parties may agree to arbitration, conciliation, or other alternative dispute resolution mechanisms.</p>
        <h3 className="text-base font-semibold text-verde-impulso">d. Preservation of Legal and Regulatory Rights</h3>
        <p>Nothing prevents either party from seeking provisional relief, filing claims or administrative matters, exercising rights under federal or Puerto Rico law, or participating in administrative, regulatory, audit, compliance, or oversight proceedings.</p>
        <h3 className="text-base font-semibold text-verde-impulso">e. Interpretation Consistent with Cooperative Law</h3>
        <p>This section is interpreted consistently with applicable cooperative law, COSSEC regulations, cooperative principles, grant agreements, and other pertinent legal provisions.</p>
      </LegalSection>

      <LegalSection title="24. General Limitation of Liability">
        <p>To the maximum extent permitted by law, FIDECOOP and its officers, directors, employees, contractors, consultants, volunteers, affiliated entities, collaborators, service providers, and representatives are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of revenue, profits, opportunities, data, savings, business relationships, reputation, goodwill, or similar losses arising from access to or use of the Sites, participation in programs, denial or termination of benefits, technological failures, reliance on content, acts or omissions of third parties, or decisions made based on information from the Sites. Non-excludable liability remains unaffected.</p>
      </LegalSection>

      <LegalSection title="25. Indemnification">
        <p>The user agrees to defend, indemnify, and hold harmless FIDECOOP and its related persons and entities from claims or expenses arising from breach of these Terms, misuse of the Sites, false or fraudulent submissions, third-party rights violations, unauthorized use of third-party materials, breach of obligations, unlawful acts, or any third-party claim resulting from user-submitted content. This does not apply to actions attributable exclusively to FIDECOOP&apos;s gross negligence, willful misconduct, or noncompliance where law does not allow indemnification.</p>
      </LegalSection>

      <LegalSection title="26. Modifications">
        <p>FIDECOOP may amend these Terms at any time. Changes are effective once published on the Sites unless another effective date is stated. Continued use after publication constitutes acceptance.</p>
      </LegalSection>

      <LegalSection title="27. Governing Law and Forum">
        <p>These Terms and any related controversy are governed by the laws of the Commonwealth of Puerto Rico and applicable federal law. Unless a mandatory administrative, mediation, arbitration, or other legally required process applies, legal actions relating to the Sites or services shall be brought before the courts with jurisdiction and venue in Puerto Rico. Mandatory administrative rights, oversight mechanisms, and protections recognized under cooperative law, consumer law, grant agreements, or federal law remain intact.</p>
      </LegalSection>

      <LegalSection title="28. Severability">
        <p>If any provision is declared invalid, void, or unenforceable, the remaining provisions remain in full force and effect.</p>
      </LegalSection>

      <LegalSection title="29. No Waiver">
        <p>FIDECOOP&apos;s failure to require strict compliance with any provision does not waive the right to require such compliance later.</p>
      </LegalSection>

      <LegalSection title="30. Reservation of Rights">
        <p>All rights, defenses, immunities, privileges, remedies, and causes of action of FIDECOOP are expressly reserved.</p>
      </LegalSection>

      <LegalSection title="31. Contact">
        <p>Questions about these Terms may be directed to FONDO DE INVERSIÓN Y DESARROLLO COOPERATIVO, INC. (FIDECOOP), 400 Ave. Américo Miranda, Suite 302, San Juan, Puerto Rico 00927-5142, or by email at info@fidecoop.coop.</p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
