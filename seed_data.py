"""
LegalPrecedent - Database Demo Data Seeder
Populates the database with realistic demonstration data for Courts, Legal Provisions,
Users, Precedent Cases, and Court Judgments.

DISCLAIMER: All case names, fact patterns, and judicial reasoning in this seed script
are fictional demonstration data generated for academic and software prototyping purposes.
"""

import sys
import hashlib
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal, Base, create_tables
from app.models.user import User
from app.models.court import Court
from app.models.legal_provision import LegalProvision
from app.models.case import Case
from app.models.judgment import Judgment
from app.models.similar_case import SimilarCase

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

def seed_database():
    print("==================================================")
    print("LegalPrecedent: Seeding Demo Database")
    print("==================================================")

    try:
        # Create all tables first
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables verified/created.")
    except Exception as e:
        print(f"[ERROR] Failed to connect to database or create tables: {e}")
        print("Please ensure MySQL is running and .env credentials are correct.")
        return False

    db: Session = SessionLocal()

    try:
        # 1. Seed Users
        if db.query(User).count() == 0:
            print("--> Seeding demo users...")
            demo_users = [
                User(
                    Name="Adv. Rajesh Sharma",
                    Email="rajesh.sharma@example.com",
                    Password=hash_pw("lawyer123"),
                    Role="Lawyer"
                ),
                User(
                    Name="Priya Menon",
                    Email="priya.menon@example.com",
                    Password=hash_pw("researcher123"),
                    Role="Legal Researcher"
                ),
                User(
                    Name="Amitav Banerjee",
                    Email="amitav.b@example.com",
                    Password=hash_pw("student123"),
                    Role="Law Student"
                ),
                User(
                    Name="Veritas Legal Partners",
                    Email="contact@veritaslegal.example.com",
                    Password=hash_pw("firm1234"),
                    Role="Law Firm"
                ),
                User(
                    Name="Sneha Kulkarni",
                    Email="sneha.k@example.com",
                    Password=hash_pw("intern123"),
                    Role="Legal Intern"
                ),
            ]
            db.add_all(demo_users)
            db.commit()
            print(f"[OK] Seeded {len(demo_users)} demo users.")
        else:
            print("[INFO] Users already exist, skipping.")

        # 2. Seed Courts
        courts_map = {}
        if db.query(Court).count() == 0:
            print("--> Seeding demo courts...")
            demo_courts = [
                Court(Court_Name="Supreme Court of India", Location="New Delhi", Court_Level="Supreme Court"),
                Court(Court_Name="High Court of Delhi", Location="New Delhi", Court_Level="High Court"),
                Court(Court_Name="High Court of Judicature at Bombay", Location="Mumbai", Court_Level="High Court"),
                Court(Court_Name="High Court of Karnataka", Location="Bengaluru", Court_Level="High Court"),
                Court(Court_Name="City Civil and Sessions Court Bengaluru", Location="Bengaluru", Court_Level="District Court"),
                Court(Court_Name="Chief Metropolitan Magistrate Court Mumbai", Location="Mumbai", Court_Level="District Court"),
                Court(Court_Name="Patiala House District Court", Location="New Delhi", Court_Level="District Court"),
            ]
            db.add_all(demo_courts)
            db.commit()
            for c in db.query(Court).all():
                courts_map[c.Court_Name] = c.Court_ID
            print(f"[OK] Seeded {len(demo_courts)} demo courts.")
        else:
            for c in db.query(Court).all():
                courts_map[c.Court_Name] = c.Court_ID
            print("[INFO] Courts already exist.")

        # 3. Seed Legal Provisions
        provisions_map = {}
        if db.query(LegalProvision).count() == 0:
            print("--> Seeding demo legal provisions...")
            demo_provisions = [
                LegalProvision(
                    Law_Name="Bharatiya Nyaya Sanhita (BNS)",
                    Section="Section 103",
                    Article=None,
                    Description="Punishment for murder. Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine."
                ),
                LegalProvision(
                    Law_Name="Bharatiya Nyaya Sanhita (BNS)",
                    Section="Section 303",
                    Article=None,
                    Description="Theft. Whoever intending to take dishonestly any movable property out of the possession of any person without consent, moves that property in order to such taking, commits theft."
                ),
                LegalProvision(
                    Law_Name="Bharatiya Nyaya Sanhita (BNS)",
                    Section="Section 318",
                    Article=None,
                    Description="Cheating. Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person."
                ),
                LegalProvision(
                    Law_Name="Bharatiya Nyaya Sanhita (BNS)",
                    Section="Section 351",
                    Article=None,
                    Description="Criminal intimidation. Threatening another with injury to person, reputation or property with intent to cause alarm."
                ),
                LegalProvision(
                    Law_Name="Constitution of India",
                    Section=None,
                    Article="Article 21",
                    Description="Protection of life and personal liberty. No person shall be deprived of his life or personal liberty except according to procedure established by law."
                ),
                LegalProvision(
                    Law_Name="Constitution of India",
                    Section=None,
                    Article="Article 14",
                    Description="Equality before law. The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India."
                ),
                LegalProvision(
                    Law_Name="Information Technology Act",
                    Section="Section 66D",
                    Article=None,
                    Description="Punishment for cheating by personation by using computer resource or digital communication device."
                ),
            ]
            db.add_all(demo_provisions)
            db.commit()
            for p in db.query(LegalProvision).all():
                key = p.Section if p.Section else p.Article
                provisions_map[key] = p.Provision_ID
            print(f"[OK] Seeded {len(demo_provisions)} demo legal provisions.")
        else:
            for p in db.query(LegalProvision).all():
                key = p.Section if p.Section else p.Article
                provisions_map[key] = p.Provision_ID
            print("[INFO] Legal provisions already exist.")

        # 4. Seed Precedent Cases & Judgments
        if db.query(Case).count() == 0:
            print("→ Seeding demo precedent cases and judgments...")
            
            c_sc = courts_map.get("Supreme Court of India", 1)
            c_dhc = courts_map.get("High Court of Delhi", 2)
            c_bhc = courts_map.get("High Court of Judicature at Bombay", 3)
            c_khc = courts_map.get("High Court of Karnataka", 4)
            c_blr_dist = courts_map.get("City Civil and Sessions Court Bengaluru", 5)
            c_mum_dist = courts_map.get("Chief Metropolitan Magistrate Court Mumbai", 6)
            c_del_dist = courts_map.get("Patiala House District Court", 7)

            p_murder = provisions_map.get("Section 103", 1)
            p_theft = provisions_map.get("Section 303", 2)
            p_cheat = provisions_map.get("Section 318", 3)
            p_threat = provisions_map.get("Section 351", 4)
            p_art21 = provisions_map.get("Article 21", 5)
            p_art14 = provisions_map.get("Article 14", 6)
            p_it66d = provisions_map.get("Section 66D", 7)

            demo_cases_data = [
                {
                    "title": "State v. Ramesh Kumar (Demo Precedent)",
                    "desc": "The accused broke into a locked commercial warehouse at night and dishonestly took electronic goods worth 5 lakhs without consent. CCTV footage and fingerprints from the door lock established identity.",
                    "offence": "Theft",
                    "location": "New Delhi",
                    "court_id": c_dhc,
                    "provision_id": p_theft,
                    "judgment": {
                        "facts": "On the night of 12th January, the accused Ramesh Kumar entered the complainant's warehouse in Okhla Industrial Area by cutting the padlock. Stolen items were recovered from his residence.",
                        "provisions": "Bharatiya Nyaya Sanhita Section 303 (Theft in building/warehouse).",
                        "reasoning": "Recovery of stolen property under discovery memos and corroborating forensic evidence leaves no reasonable doubt regarding dishonest taking of movable property without consent.",
                        "decision": "Accused found guilty of theft and sentenced to 2 years rigorous imprisonment along with a fine of Rs. 25,000."
                    }
                },
                {
                    "title": "State of Maharashtra v. Vicky Deshmukh (Demo Precedent)",
                    "desc": "Night-time break-in and theft of high-end consumer electronics from an electronics showroom in Andheri Mumbai. Lock picked and inventory removed via a rented van.",
                    "offence": "Theft",
                    "location": "Mumbai",
                    "court_id": c_bhc,
                    "provision_id": p_theft,
                    "judgment": {
                        "facts": "Accused Vicky Deshmukh gained unauthorized entry into an electronic retail outlet after business hours and took laptops and smartphones valued at Rs. 8 lakhs.",
                        "provisions": "Bharatiya Nyaya Sanhita Section 303 (Theft).",
                        "reasoning": "Direct evidence through store security cameras combined with recovery of serialized electronics established the complete chain of theft.",
                        "decision": "Convicted and sentenced to 3 years rigorous imprisonment."
                    }
                },
                {
                    "title": "State of Karnataka v. Suresh Babu (Demo Precedent)",
                    "desc": "The accused snatched a gold chain from a pedestrian walking on the street in Koramangala Bengaluru during evening hours and fled on a motorcycle.",
                    "offence": "Theft and Snatching",
                    "location": "Bengaluru",
                    "court_id": c_blr_dist,
                    "provision_id": p_theft,
                    "judgment": {
                        "facts": "Complainant was walking near Koramangala 4th Block when the accused on an unnumbered motorcycle snatched a 24-gram gold chain and sped away.",
                        "provisions": "Bharatiya Nyaya Sanhita Section 303 (Theft from person).",
                        "reasoning": "Eyewitness identification at Test Identification Parade and recovery of melted gold from a jeweler confirmed participation.",
                        "decision": "Accused convicted and sentenced to 2.5 years rigorous imprisonment with Rs. 10,000 fine."
                    }
                },
                {
                    "title": "Vikram Financial Services v. Sanjay Agarwal (Demo Precedent)",
                    "desc": "The accused induced multiple investors into transferring funds to a dummy shell company by promising guaranteed 30% quarterly returns on fake real estate bonds.",
                    "offence": "Cheating and Fraud",
                    "location": "Mumbai",
                    "court_id": c_mum_dist,
                    "provision_id": p_cheat,
                    "judgment": {
                        "facts": "Sanjay Agarwal floated a fraudulent investment scheme claiming affiliation with government infrastructure funds, collecting Rs. 2.4 crores from 40 victims.",
                        "provisions": "Bharatiya Nyaya Sanhita Section 318 (Cheating and dishonestly inducing delivery of property).",
                        "reasoning": "Bank statements and audit trail clearly demonstrated dishonest intention from the inception of the transaction, satisfying all ingredients of cheating.",
                        "decision": "Guilty of cheating; sentenced to 4 years imprisonment with order for asset attachment for victim restitution."
                    }
                },
                {
                    "title": "Cyber Cell Delhi v. Ashish Mehta (Demo Precedent)",
                    "desc": "Online phishing scheme where accused posed as a bank manager, obtained OTPs via spoofed phone calls, and siphoned 15 lakhs from senior citizen accounts.",
                    "offence": "Cyber Cheating and Identity Impersonation",
                    "location": "New Delhi",
                    "court_id": c_dhc,
                    "provision_id": p_it66d,
                    "judgment": {
                        "facts": "The accused impersonated bank officials over VoIP calls to gain login credentials and OTPs, transferring funds to multiple digital wallets.",
                        "provisions": "Information Technology Act Section 66D and BNS Section 318.",
                        "reasoning": "Digital IP logs, telecom call records, and digital wallet beneficiary accounts conclusively linked the accused to the fraudulent transfers.",
                        "decision": "Convicted under Section 66D IT Act and sentenced to 3 years imprisonment and Rs. 50,000 fine."
                    }
                },
                {
                    "title": "State v. Arvind Rathore (Demo Precedent)",
                    "desc": "Premeditated attack resulting in death of business partner over property dispute in Connaught Place New Delhi. Weapon recovered at the instance of the accused.",
                    "offence": "Murder",
                    "location": "New Delhi",
                    "court_id": c_del_dist,
                    "provision_id": p_murder,
                    "judgment": {
                        "facts": "The accused Arvind Rathore assaulted the deceased with a lethal weapon causing fatal head injuries following a prolonged commercial property dispute.",
                        "provisions": "Bharatiya Nyaya Sanhita Section 103 (Punishment for murder).",
                        "reasoning": "Motive, medical evidence indicating fatal injury caused intentionally, and recovery of blood-stained weapon under Section 27 Evidence Act proved murder beyond reasonable doubt.",
                        "decision": "Accused sentenced to Life Imprisonment and fine of Rs. 1,00,000."
                    }
                },
                {
                    "title": "People's Union for Rights v. Union of India (Demo Precedent)",
                    "desc": "Public interest litigation challenging prolonged pre-trial detention of undertrial prisoners without timely trial or access to legal aid.",
                    "offence": "Violation of Fundamental Liberty",
                    "location": "New Delhi",
                    "court_id": c_sc,
                    "provision_id": p_art21,
                    "judgment": {
                        "facts": "Petitioners highlighted several undertrial prisoners languishing in prisons for periods exceeding half of their maximum possible sentence without trial progress.",
                        "provisions": "Constitution of India Article 21 (Right to Speedy Trial and Personal Liberty).",
                        "reasoning": "The right to a speedy and fair trial is an integral part of the fundamental right to life and personal liberty guaranteed under Article 21.",
                        "decision": "Directions issued to all High Courts and District Legal Services Authorities to identify and release eligible undertrial prisoners on personal bond."
                    }
                },
                {
                    "title": "Karan Malhotra v. State of Karnataka (Demo Precedent)",
                    "desc": "Accused issued repeated verbal and written death threats to a contractor demanding extortion money for continuing construction work in Whitefield Bengaluru.",
                    "offence": "Criminal Intimidation and Extortion",
                    "location": "Bengaluru",
                    "court_id": c_khc,
                    "provision_id": p_threat,
                    "judgment": {
                        "facts": "Accused threatened the contractor with physical harm to him and his family if 10% project kickback was not remitted.",
                        "provisions": "Bharatiya Nyaya Sanhita Section 351 (Criminal Intimidation).",
                        "reasoning": "Recorded phone audio and corroborated witness statements proved intentional alarm caused with threat of injury to person.",
                        "decision": "Accused convicted and sentenced to 1 year imprisonment."
                    }
                }
            ]

            for item in demo_cases_data:
                case_obj = Case(
                    Case_Title=item["title"],
                    Case_Description=item["desc"],
                    Offence=item["offence"],
                    Location=item["location"],
                    Court_ID=item["court_id"],
                    Legal_Provision_ID=item["provision_id"]
                )
                db.add(case_obj)
                db.commit()
                db.refresh(case_obj)

                # Add attached judgment
                j_data = item["judgment"]
                judgment_obj = Judgment(
                    Case_ID=case_obj.Case_ID,
                    Case_Facts=j_data["facts"],
                    Legal_Provisions=j_data["provisions"],
                    Court_Reasoning=j_data["reasoning"],
                    Final_Decision=j_data["decision"]
                )
                db.add(judgment_obj)
                db.commit()

            print(f"[OK] Seeded {len(demo_cases_data)} precedent cases and judgments.")
        else:
            print("[INFO] Cases and judgments already exist.")

        print("==================================================")
        print("[OK] Demo database seeding completed successfully!")
        print("==================================================")
        return True

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding demo database: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = seed_database()
    if not success:
        sys.exit(1)
