import { ResumeData } from '../types/resume.ts';

export const DEFAULT_VINAY_RESUME: ResumeData = {
  fullName: 'Vinay Kumar',
  jobTitle: 'Data Analyst',
  email: 'vinay22y95@gmail.com',
  phone: '9288134190, 7488134190',
  location: 'Gurugram, Haryana, India',
  website: 'vinaykr.netlify.app',
  linkedin: 'linkedin.com/in/vinay-kumar-yr95',
  github: 'github.com/vinaykumar28yr',
  avatarInitials: 'VK',
  summary:
    'Data analyst with **6+ years** of experience who turns messy spreadsheets into decisions a manager can act on. Writes **SQL and Python**, builds **Tableau dashboards**, and puts together quick **Excel** models. Project work spans sales, finance, supply chain, and customer behavior, including demand forecasting, and **machine learning models** that predict outcomes across **8+ projects**. Comfortable explaining findings to nontechnical audiences.',
  experiences: [
    {
      id: 'exp-1',
      role: 'Data Analyst',
      company: 'Neelam Cycle',
      location: 'Jharkhand',
      period: 'February 2020 – Present',
      bullets: [
        'Analyzed business and operational records in **SQL and Excel** to spot sales trends and process improvements.',
        'Identified the main causes of product damage and recommended fixes that **cut damage by 75%**.',
        'Developed **predictive models** on market trends to guide stock levels and inventory planning, contributing to a **12% revenue increase**.',
        'Applied **machine learning** to EV operations, **building regression models** that forecast delays for parts and vehicles from shipment and vendor records and giving the supply chain team early warning.',
        'Presented findings to **non-technical stakeholders** through **Tableau dashboards**.',
        'Segmented customers to clear excess stock and sharpen sell-through.',
      ],
    },
    {
      id: 'exp-2',
      role: 'Data Analyst Trainee',
      company: 'Cuvette Tech',
      location: 'Remote',
      period: 'June 2025 – September 2025',
      bullets: [
        'Completed **10+ hands-on projects** in **4 months** across **business analysis, visualization, and predictive modeling**.',
        'Wrote **80+ SQL queries** and produced **50+ Excel reports** with formulas and PivotTables.',
        'Trained a classification model that predicts hotel cancellations with **80% accuracy**.',
        'Designed **70+ interactive Tableau dashboards** covering population, profitability, margins, and shipping speed.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'TOP 2000 COMPANIES FINANCIAL ANALYSIS',
      techTag: 'Excel',
      bullets: [
        'Examined financial metrics across **2,000 companies** using **formulas and PivotTables**.',
        'Spotted outliers and recurring patterns that point to business-relevant trends.',
      ],
    },
    {
      id: 'proj-2',
      title: 'GLOBAL RETAIL SALES ANALYSIS',
      techTag: 'Excel',
      bullets: [
        'Compared regional sales to gauge business performance.',
        'Built **interactive dashboards** to monitor sales results at a glance.',
      ],
    },
    {
      id: 'proj-3',
      title: 'OLYMPICS DATA ANALYSIS',
      techTag: 'SQL',
      bullets: [
        'Queried athlete performance, medal tallies, and country participation.',
        '**Organized raw records into clean result sets** for easy comparison.',
      ],
    },
    {
      id: 'proj-4',
      title: 'BIKE STORE SALES ANALYSIS',
      techTag: 'SQL',
      bullets: [
        'Studied seasonal sales trends and buying patterns across product categories.',
        'Highlighted how different products and customer groups performed.',
      ],
    },
    {
      id: 'proj-5',
      title: 'WORLD POPULATION ANALYSIS',
      techTag: 'Tableau',
      bullets: [
        'Visualized demographic shifts, growth rates, and regional comparisons.',
        'Made the **visuals interactive** so viewers can explore trends themselves.',
      ],
    },
    {
      id: 'proj-6',
      title: 'SUPERSTORE SALES & PROFIT DASHBOARD',
      techTag: 'Tableau',
      bullets: [
        'Designed a **dashboard tracking sales, profit margins, and shipping performance**.',
        'Surfaced business trends and performance patterns in one view.',
      ],
    },
    {
      id: 'proj-7',
      title: 'HOTEL BOOKING CANCELLATION PREDICTION',
      techTag: 'Machine Learning',
      bullets: [
        'Trained a **logistic regression model** to predict booking cancellations with **80% accuracy**.',
        'Explored booking data to find patterns behind cancellations.',
      ],
    },
    {
      id: 'proj-8',
      title: 'DELIVERY DELAY PREDICTION',
      techTag: 'Machine Learning',
      bullets: [
        '**Developed a regression model** that forecasts delivery delays from shipment and vendor data.',
        'Supported proactive supply-chain planning with the predictions.',
      ],
    },
  ],
  skills: [
    {
      id: 'sk-1',
      category: 'Languages',
      items: 'Python, SQL',
      skillLevels: {
        Python: 'Expert',
        SQL: 'Expert',
      },
    },
    {
      id: 'sk-2',
      category: 'Machine Learning',
      items: 'Classification, Regression, Logistic Regression, Predictive Modeling',
      skillLevels: {
        Classification: 'Expert',
        Regression: 'Expert',
        'Logistic Regression': 'Expert',
        'Predictive Modeling': 'Proficient',
      },
    },
    {
      id: 'sk-3',
      category: 'Visualization & BI',
      items: 'Tableau, Looker Studio, Dashboard Development',
      skillLevels: {
        Tableau: 'Expert',
        'Looker Studio': 'Proficient',
        'Dashboard Development': 'Expert',
      },
    },
    {
      id: 'sk-4',
      category: 'Excel',
      items: 'Formulas, PivotTables',
      skillLevels: {
        Formulas: 'Expert',
        PivotTables: 'Expert',
      },
    },
    {
      id: 'sk-5',
      category: 'Analysis',
      items: 'Data Cleaning, Exploratory Analysis, Trend Analysis, Customer Segmentation, Forecasting',
      skillLevels: {
        'Data Cleaning': 'Expert',
        'Exploratory Analysis': 'Expert',
        'Trend Analysis': 'Expert',
        'Customer Segmentation': 'Proficient',
        Forecasting: 'Proficient',
      },
    },
  ],
  certificates: [
    { id: 'cert-1', name: 'Data Science Course Certificate', date: 'September 2025' },
    { id: 'cert-2', name: 'Excel Module Completion Certificate', date: 'September 2025' },
    { id: 'cert-3', name: 'SQL Module Completion Certificate', date: 'September 2025' },
    { id: 'cert-4', name: 'Tableau Module Completion Certificate', date: 'September 2025' },
    { id: 'cert-5', name: 'Machine Learning Module Completion Certificate', date: 'September 2025' },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Engineering in Information Technology',
      institution: 'University Institute of Technology, University of Burdwan',
      period: 'July 2014 to June 2018',
    },
  ],
  languages: [
    { id: 'lang-1', language: 'English', proficiency: 'Fluent', levelPercent: 95 },
    { id: 'lang-2', language: 'Hindi', proficiency: 'Native', levelPercent: 100 },
    { id: 'lang-3', language: 'Bangla', proficiency: 'Proficient', levelPercent: 85 },
  ],
};

export interface SampleJobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

export const SAMPLE_JOB_DESCRIPTIONS: SampleJobDescription[] = [
  {
    id: 'jd-senior-da',
    title: 'Senior Data Analyst — Supply Chain & BI',
    company: 'Global Logistics & Retail Corp',
    location: 'Gurugram / Hybrid',
    description: `We are seeking a Senior Data Analyst with 5+ years of experience turning operational and financial data into actionable executive insights.
Key Responsibilities:
- Write complex SQL queries and Python scripts for ETL, data cleaning, and exploratory analysis across large datasets.
- Build and maintain interactive Tableau dashboards, Power BI reports, and Looker Studio visualizations tracking KPI metrics, profit margins, and supply chain SLA performance.
- Develop predictive modeling, demand forecasting, A/B testing, and regression models to optimize inventory planning and reduce delivery delays.
- Partner with cross-functional stakeholders in finance, sales, and operations using Excel PivotTables, Snowflake, and statistical analysis.`,
  },
  {
    id: 'jd-ml-analyst',
    title: 'Decision Scientist & Machine Learning Analyst',
    company: 'FinTech Velocity Labs',
    location: 'Bengaluru / Remote',
    description: `Looking for a Decision Scientist skilled in Python, SQL, Machine Learning, Classification, Logistic Regression, and Customer Segmentation.
Requirements:
- Proven track record of training classification and regression models with high accuracy to predict customer churn, booking cancellations, and revenue growth.
- Strong expertise in Tableau, Looker Studio, Git, feature engineering, cohort analysis, and executive storytelling.
- Ability to translate complex statistical models into clear business recommendations for non-technical leadership.`,
  },
  {
    id: 'jd-bi-lead',
    title: 'Business Intelligence & Analytics Lead',
    company: 'Apex Enterprise Commerce',
    location: 'Mumbai / Remote',
    description: `Join our BI team to architect executive dashboards and automated reporting pipelines.
Core Skills Needed:
- Advanced SQL, Python, Excel (Formulas, PivotTables, Macros), and Tableau Dashboard Development.
- Experience in financial analysis, retail sales analysis, trend analysis, forecasting, and stakeholder management.
- Track record of driving measurable revenue increase and cost reduction through data-driven root cause analysis.`,
  },
];

export const MULTILANG_PRESETS: Record<string, { label: string; marketNorm: string; resume: Partial<ResumeData> }> = {
  en: {
    label: 'English (US / Global ATS Standard)',
    marketNorm: 'Reverse-chronological, action-verb bullets with quantified ROI metrics, zero graphics in text flow.',
    resume: DEFAULT_VINAY_RESUME,
  },
  de: {
    label: 'Deutsch (DACH Lebenslauf Standard)',
    marketNorm: 'Structured German Lebenslauf format with precise dates, technical competencies, and formal academic credentials.',
    resume: {
      jobTitle: 'Senior Datenanalyst & BI-Spezialist',
      summary:
        'Datenanalyst mit **6+ Jahren** Erfahrung in der Transformation komplexer Datensätze in strategische Managemententscheidungen. Experte für **SQL und Python**, interaktive **Tableau-Dashboards** sowie **Machine-Learning-Modelle** (Regression & Klassifikation) über **8+ Großprojekte**.',
    },
  },
  es: {
    label: 'Español (EU & LATAM Currículum)',
    marketNorm: 'Competency-driven Spanish CV optimized for European & Latin American applicant tracking systems.',
    resume: {
      jobTitle: 'Analista de Datos Senior & Especialista en BI',
      summary:
        'Analista de datos con **6+ años** de experiencia transformando hojas de cálculo complejas en decisiones ejecutivas. Dominio de **SQL y Python**, **dashboards en Tableau**, modelos en **Excel** y **modelos de Machine Learning** en **8+ proyectos**.',
    },
  },
  fr: {
    label: 'Français (France / Canada CV)',
    marketNorm: 'Concise French executive synthesis emphasizing analytical rigor, business impact, and bilingual fluency.',
    resume: {
      jobTitle: 'Analyste de Données & Expert Business Intelligence',
      summary:
        'Analyste de données avec **6+ ans** d’expérience transformant des données complexes en décisions stratégiques. Maîtrise de **SQL et Python**, **tableaux de bord Tableau**, modélisation **Excel** et **Machine Learning** sur **8+ projets**.',
    },
  },
  hi: {
    label: 'Hindi / English (India Enterprise ATS)',
    marketNorm: 'Bilingual technical terminology preserving core ATS keywords (SQL, Python, Tableau) alongside regional executive framing.',
    resume: {
      jobTitle: 'Senior Data Analyst (SQL, Python & Tableau BI)',
      summary:
        'Data Analyst with **6+ years** of experience across India enterprise operations turning complex spreadsheets into management decisions. Proven expertise in **SQL and Python**, **Tableau Dashboards**, **Excel PivotTables**, and **Machine Learning Models** across **8+ projects**.',
    },
  },
  ja: {
    label: 'Japanese / English (APAC Shokumu Keirekisho)',
    marketNorm: 'Japanese Shokumu Keirekisho format emphasizing project scale, quantitative accuracy, and cross-functional team contribution.',
    resume: {
      jobTitle: 'Lead Data Analyst & BI Specialist (APAC)',
      summary:
        'Data Analyst with **6+ years** of industrial experience delivering **SQL and Python** analytics, **Tableau dashboards**, **Excel** financial modeling, and **Machine Learning** forecasting across **8+ enterprise projects**.',
    },
  },
};
