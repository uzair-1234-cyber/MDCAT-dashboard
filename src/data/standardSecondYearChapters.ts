import { SubjectName, AcademicYear } from '../types';

export interface PredefinedChapter {
  subject: SubjectName;
  chapterNumber: number;
  title: string;
  topics: string[];
  classYear: AcademicYear;
}

export const STANDARD_SECOND_YEAR_CHAPTERS: PredefinedChapter[] = [
  // Biology Class XII
  {
    subject: 'Biology',
    chapterNumber: 1,
    title: 'Homeostasis',
    topics: ['Osmoregulation in Plants and Animals', 'Excretion in Humans & Nephron Structure', 'Countercurrent Mechanism', 'Thermoregulation & Fevers'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 2,
    title: 'Support and Movement',
    topics: ['Human Skeletal Framework & Bone Histology', 'Joints and Disorders (Arthritis)', 'Skeletal Muscle Ultrastructure & Sarcomere', 'Sliding Filament Mechanism & Rigor Mortis'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 3,
    title: 'Coordination and Control',
    topics: ['Nerve Impulse, Resting Potential & Action Potential', 'Synaptic Transmission & Neurotransmitters', 'Human Brain, Spinal Cord & Autonomic Nervous System', 'Endocrine Glands, Hormonal Feedback & Disorders'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 4,
    title: 'Reproduction',
    topics: ['Male & Female Human Reproductive Systems', 'Gametogenesis (Spermatogenesis & Oogenesis)', 'Menstrual Cycle & Hormonal Feedback Loops', 'Sexually Transmitted Infections & Infertility Treatments'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 5,
    title: 'Growth and Development',
    topics: ['Embryonic Development in Chick', 'Role of Cytoplasm in Development', 'Aging, Regeneration and Abnormal Development'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 6,
    title: 'Chromosomes and DNA',
    topics: ['Chromatin Structure & Nucleosomes', 'DNA as Hereditary Material (Griffith, Hershey-Chase)', 'Meselson-Stahl Experiment & DNA Replication', 'Transcription, Genetic Code & Translation'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 7,
    title: 'Cell Cycle',
    topics: ['Phases of Cell Cycle (Interphase G1, S, G2)', 'Mitosis Phases & Cytokinesis', 'Meiosis I & Meiosis II Crossing Over', 'Apoptosis vs Necrosis and Cancer Genesis'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 8,
    title: 'Variation and Genetics',
    topics: ['Mendel’s Laws of Inheritance', 'Incomplete Dominance, Codominance & Multiple Alleles', 'Epistasis and Polygenic Inheritance', 'Gene Linkage and Crossing Over in Humans'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 9,
    title: 'Biotechnology',
    topics: ['Recombinant DNA Technology & Restriction Enzymes', 'Polymerase Chain Reaction (PCR) & Gel Electrophoresis', 'Transgenic Microbes, Plants and Animals', 'Human Genome Project & Gene Therapy Approaches'],
    classYear: '2nd Year',
  },
  {
    subject: 'Biology',
    chapterNumber: 10,
    title: 'Evolution',
    topics: ['Lamarckism vs Darwinism', 'Evidences for Evolution (Anatomy, Paleontology, Molecular)', 'Hardy-Weinberg Equilibrium & Population Genetics', 'Mechanisms of Speciation'],
    classYear: '2nd Year',
  },

  // Chemistry Class XII
  {
    subject: 'Chemistry',
    chapterNumber: 1,
    title: 'Periodic Classification & s-Block Elements',
    topics: ['Periodic Trends across Period 3', 'Alkali & Alkaline Earth Metals Properties', 'Diagonal Relationships & Anomalous Behavior of Li/Be', 'Industrial Manufacture of Sodium & Caustic Soda'],
    classYear: '2nd Year',
  },
  {
    subject: 'Chemistry',
    chapterNumber: 2,
    title: 'd and f Block Transition Elements',
    topics: ['General Characteristics & Variable Oxidation States', 'Crystal Field Theory & Color in Transition Complexes', 'Coordination Compounds, IUPAC Nomenclature & Ligands', 'Industrial Catalysts & Metallurgy of Copper'],
    classYear: '2nd Year',
  },
  {
    subject: 'Chemistry',
    chapterNumber: 3,
    title: 'Fundamental Principles of Organic Chemistry',
    topics: ['Classification & Nomenclature of Organic Molecules', 'Isomerism: Structural, Geometrical & Optical', 'Hybridization of Carbon (sp3, sp2, sp)', 'Resonance & Inductive Effects in Reactivity'],
    classYear: '2nd Year',
  },
  {
    subject: 'Chemistry',
    chapterNumber: 4,
    title: 'Hydrocarbons',
    topics: ['Alkanes: Free Radical Substitution Mechanism', 'Alkenes: Electrophilic Addition & Markownikoff’s Rule', 'Alkynes: Acidity of Terminal Alkynes & Polymerization', 'Benzene: Aromaticity, Resonance & Electrophilic Aromatic Substitution'],
    classYear: '2nd Year',
  },
  {
    subject: 'Chemistry',
    chapterNumber: 5,
    title: 'Alkyl Halides and Amines',
    topics: ['SN1 vs SN2 Nucleophilic Substitution Mechanisms', 'E1 vs E2 Elimination Reactions', 'Grignard Reagents Preparation and Reactions', 'Classification and Basicity of Amines'],
    classYear: '2nd Year',
  },
  {
    subject: 'Chemistry',
    chapterNumber: 6,
    title: 'Alcohols, Phenols and Ethers',
    topics: ['Classification of Alcohols & Lucas Test Distinction', 'Acidity of Phenol vs Ethanol & Resonance Stabilization', 'Electrophilic Substitution of Phenol (Nitration, Bromination)', 'Preparation and Cleavage of Ethers by HI'],
    classYear: '2nd Year',
  },
  {
    subject: 'Chemistry',
    chapterNumber: 7,
    title: 'Aldehydes and Ketones',
    topics: ['Nucleophilic Addition Mechanisms (HCN, NaHSO3)', 'Tollens’, Fehling’s and Benedict’s Tests', 'Aldol Condensation & Cannizzaro Reaction', 'Haloform / Iodoform Reaction for Methyl Ketones'],
    classYear: '2nd Year',
  },
  {
    subject: 'Chemistry',
    chapterNumber: 8,
    title: 'Carboxylic Acids & Macromolecules',
    topics: ['Acidity of Carboxylic Acids & Inductive Substituent Effects', 'Nucleophilic Acyl Substitution (Esters, Amides, Anhydrides)', 'Amino Acids, Peptide Linkages & Zwitterions', 'Synthetic Polymers, Nylon, Polyesters & Plastics'],
    classYear: '2nd Year',
  },

  // Physics Class XII
  {
    subject: 'Physics',
    chapterNumber: 1,
    title: 'Electrostatics',
    topics: ['Coulomb’s Law in Vector Form & Dielectrics', 'Electric Field Intensity & Electric Potential Gradient', 'Gauss’s Law & Three Classical Applications', 'Capacitance of Parallel Plate Capacitor & Dielectric Polarization'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 2,
    title: 'Current Electricity',
    topics: ['Drift Velocity, Current Density & Microscopic Ohm’s Law', 'Temperature Coefficient of Resistance (alpha)', 'Kirchhoff’s Current Law (KCL) & Voltage Law (KVL)', 'Potentiometer Principle, Calibration & Measurement of EMF'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 3,
    title: 'Electromagnetism',
    topics: ['Magnetic Field due to Current & Ampere’s Circuital Law', 'Force on a Current-Carrying Conductor in Magnetic Field', 'Lorentz Force on Moving Charges & e/m Ratio of Electron', 'Moving Coil Galvanometer, Conversion to Ammeter & Voltmeter'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 4,
    title: 'Electromagnetic Induction',
    topics: ['Faraday’s Law of Electromagnetic Induction & Induced EMF', 'Lenz’s Law & Conservation of Energy Principle', 'Self-Inductance, Mutual Inductance & Energy in Inductor', 'A.C Generator Mechanism & Power Transformers Efficiency'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 5,
    title: 'Alternating Current Circuits',
    topics: ['Peak, Peak-to-Peak & RMS Values of AC Voltage/Current', 'Phase Relationship in Pure R, L, and C Circuits', 'Series R-L-C Circuit & Electrical Resonance Condition', 'Power Dissipation, Power Factor & Choke Coil Application'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 6,
    title: 'Physics of Solids',
    topics: ['Crystalline, Amorphous and Polymeric Solids Structure', 'Stress, Strain, Young’s Modulus & Elastic Limit', 'Energy Band Theory (Conductors, Insulators, Semiconductors)', 'Superconductivity, Critical Temperature & Meissner Effect'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 7,
    title: 'Electronics',
    topics: ['p-n Junction Diode Formation, Depletion Region & Biasing', 'Half-Wave and Full-Wave Bridge Rectification Circuits', 'Bipolar Junction Transistor (BJT) Characteristics & Common Emitter Amplifier', 'Operational Amplifiers as Inverting & Non-Inverting Amplifiers'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 8,
    title: 'Dawn of Modern Physics',
    topics: ['Special Theory of Relativity Postulates & Mass-Energy Equivalence', 'Blackbody Radiation & Planck’s Quantum Hypothesis', 'Photoelectric Effect, Einstein’s Equation & Stopping Potential', 'Compton Effect & de Broglie Matter Waves Hypothesis'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 9,
    title: 'Atomic Spectra',
    topics: ['Bohr’s Model of Hydrogen Atom & Energy Level Postulates', 'Hydrogen Emission Series (Lyman, Balmer, Paschen, Brackett, Pfund)', 'Inner Shell Transitions & Production of Characteristic X-Rays', 'Population Inversion, Stimulated Emission & Laser Principles'],
    classYear: '2nd Year',
  },
  {
    subject: 'Physics',
    chapterNumber: 10,
    title: 'Nuclear Physics',
    topics: ['Atomic Nucleus, Mass Defect & Nuclear Binding Energy Curve', 'Radioactive Decay Law, Half-Life & Decay Constant Calculations', 'Alpha, Beta & Gamma Rays Properties and Biological Hazards', 'Nuclear Fission, Chain Reaction, Critical Mass & Nuclear Fusion'],
    classYear: '2nd Year',
  },
];
