# Retrosynthesis Quick Start Guide

## 🚀 Get Started in 5 Minutes

### What is Retrosynthesis Mapping?

Retrosynthesis is the process of working **backwards** from a target molecule to identify synthetic pathways using available starting materials. Our AI-powered tool automates this process, generating multiple optimal routes ranked by feasibility.

## 📝 Step-by-Step Tutorial

### Step 1: Access the Platform

```
1. Open ComputeLab in your browser
2. Look for the sidebar on the left
3. Click "Retrosynthesis" (marked with 🔥 HOT badge)
```

### Step 2: Enter Your Target Molecule

**Option A: SMILES String**
```
1. Find the SMILES input box
2. Paste your SMILES string
   Example (Aspirin): CC(=O)Oc1ccccc1C(=O)O
3. The structure will appear in the 3D viewer below
```

**Option B: Upload File**
```
1. Click "Upload Structure File"
2. Select .mol, .sdf, or .pdb file
3. File will be automatically parsed
```

### Step 3: Configure Settings

```
┌─────────────────────────────────────┐
│ Number of Pathways: [10]      ▼    │  ← How many routes to generate
├─────────────────────────────────────┤
│ Maximum Steps: [5]                  │  ← Complexity limit
├─────────────────────────────────────┤
│ Model: [NeuralSym]           ▼     │  ← AI model selection
├─────────────────────────────────────┤
│ Filter: [Commercial]         ▼     │  ← Starting material filter
└─────────────────────────────────────┘
```

**Recommended Settings for Beginners:**
- Pathways: 10
- Max Steps: 5
- Model: NeuralSym
- Filter: Commercially Available Only

### Step 4: Generate Pathways

```
1. Click the blue "🚀 Generate Pathways" button
2. Wait 10-30 seconds (varies by molecule complexity)
3. Results will appear automatically
```

### Step 5: Explore Results

**Results Tab**
```
You'll see pathway cards like this:

┌────────────────────────────────────┐
│ Pathway 1              Score: 94.2 │
│ ────────────────────────────────── │
│ 3 steps • $245 estimated cost      │
│                                     │
│ Step 1: Friedel-Crafts Acylation   │
│         Yield: 85%                  │
│ ↓                                   │
│ Step 2: Hydrolysis                 │
│         Yield: 92%                  │
│ ↓                                   │
│ Step 3: Acetylation                │
│         Yield: 88%                  │
│                                     │
│ Starting Materials:                 │
│ • Benzene ($15/g)                  │
│ • Acetic acid ($10/L)              │
│                                     │
│ [View Details]                     │
└────────────────────────────────────┘
```

**Analysis Tab**
```
View:
• Comparison chart of all pathways
• SA (Synthetic Accessibility) Score
• Common starting materials table
• Success probability metrics
```

**Export Tab**
```
Download results in:
✓ JSON (for further analysis)
✓ CSV (spreadsheet format)
✓ PDF (publication-ready report)
✓ SMILES (text file)
```

## 📊 Understanding the Results

### Pathway Score (0-100)

| Score | Meaning | Action |
|-------|---------|--------|
| 90-100 | Excellent - Highly feasible | ✅ Proceed with confidence |
| 80-89 | Good - Feasible route | ✅ Minor optimization may help |
| 70-79 | Fair - Challenging | ⚠️ Expert chemistry needed |
| <70 | Poor - Very difficult | ❌ Consider alternatives |

### What Each Metric Means

**Score**: Overall feasibility (higher is better)
**Steps**: Number of synthetic operations (fewer is better)
**Cost**: Estimated material cost (lower is better)
**Yield**: Expected product percentage per step

### SA Score (Synthetic Accessibility)

Range: 1-10 (lower is easier)

```
1-3: Very easy to synthesize
4-6: Moderate difficulty
7-8: Challenging
9-10: Extremely difficult
```

## 🎯 Example Molecules to Try

### Beginner Examples

**1. Aspirin** (Very Easy)
```
SMILES: CC(=O)Oc1ccccc1C(=O)O
Expected: ~10 pathways, scores 90+, 1-3 steps
Time: ~15 seconds
```

**2. Paracetamol** (Easy)
```
SMILES: CC(=O)Nc1ccc(O)cc1
Expected: ~8 pathways, scores 85+, 2-4 steps
Time: ~20 seconds
```

**3. Ibuprofen** (Easy)
```
SMILES: CC(C)Cc1ccc(C(C)C(=O)O)cc1
Expected: ~12 pathways, scores 80+, 3-5 steps
Time: ~25 seconds
```

### Intermediate Examples

**4. Caffeine** (Medium)
```
SMILES: CN1C=NC2=C1C(=O)N(C(=O)N2C)C
Expected: ~10 pathways, scores 70-85, 4-6 steps
Time: ~45 seconds
```

**5. Penicillin G** (Medium-Hard)
```
SMILES: CC1(C)SC2C(NC(=O)Cc3ccccc3)C(=O)N2C1C(=O)O
Expected: ~5-8 pathways, scores 65-80, 5-8 steps
Time: ~90 seconds
```

## 🔧 Troubleshooting

### Issue: "No pathways found"

**Cause**: Target may be too complex or invalid SMILES

**Solutions**:
1. ✓ Verify SMILES is correct (use online validator)
2. ✓ Increase "Maximum Steps" to 8-10
3. ✓ Change model to "RetroStar" (more exploratory)
4. ✓ Switch filter to "All" instead of "Commercial"

### Issue: "All scores are below 70"

**Cause**: Molecule is synthetically challenging

**Solutions**:
1. ✓ Review pathway details - some may still be viable
2. ✓ Consider breaking target into simpler substructures
3. ✓ Consult with synthetic chemist for expert opinion
4. ✓ Look for alternative target molecules

### Issue: "Results taking too long"

**Normal wait times**:
- Simple (<20 atoms): 10-30 seconds
- Medium (20-50 atoms): 30-120 seconds
- Complex (>50 atoms): 2-5 minutes

**If longer**:
1. ✓ Check browser console for errors
2. ✓ Refresh page and try again
3. ✓ Try simpler molecule first to test system
4. ✓ Reduce number of pathways requested

## 💡 Pro Tips

### 1. Start Simple
```
Begin with known drugs or simple molecules
Learn to interpret results before tackling complex targets
```

### 2. Compare Multiple Pathways
```
Don't just pick the highest score
Consider: cost, availability, lab capabilities
```

### 3. Iterate on Settings
```
Try different models for the same molecule
Adjust step limits to explore longer routes
```

### 4. Use Filters Wisely
```
"Commercial" = Fastest, most practical
"Building Blocks" = More options, still reasonable
"All" = Maximum exploration, may be impractical
```

### 5. Document Your Work
```
Use the Export tab to save results
Share links with collaborators
Generate PDF reports for presentations
```

## 🧪 Real-World Workflow

### Academic Research
```
1. Design novel compound in silico
2. Run retrosynthesis analysis
3. Evaluate feasibility (score, cost, steps)
4. Select best pathway
5. Export PDF for lab notebook
6. Share with synthesis team
```

### Drug Discovery
```
1. Hit compound identified from screening
2. Analyze 20-50 synthetic routes
3. Filter by commercial availability
4. Calculate cost for 1g, 10g, 100g scale
5. Present top 3 routes to chemistry team
6. Begin experimental validation
```

### Chemical Education
```
1. Present target molecule to students
2. Have students predict routes manually
3. Run retrosynthesis tool
4. Compare student predictions to AI results
5. Discuss feasibility and optimization
6. Assign synthesis planning homework
```

## 📚 Further Learning

### Video Tutorials (Coming Soon)
- Basic retrosynthesis concepts
- Using the platform effectively
- Interpreting complex results
- Advanced optimization strategies

### Documentation
- [RETROSYNTHESIS-GUIDE.md](RETROSYNTHESIS-GUIDE.md) - Complete reference
- [API-EXAMPLES.md](API-EXAMPLES.md) - Programmatic access
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - Self-hosting

### Research Papers
- "Neural-Symbolic Machine Learning for Retrosynthesis" (2021)
- "RetroStar: Monte Carlo Tree Search" (2020)
- "Molecular Transformer for Chemical Reaction" (2019)

## 🤝 Community & Support

### Get Help
- 📧 Email: retro-support@computelab.io
- 💬 Forum: https://community.computelab.io
- 📖 Docs: https://docs.computelab.io

### Share Your Results
- Tweet with #ComputeLabRetro
- Post in community forum
- Submit use cases for feature blog

## ⚡ Quick Reference Card

```
┌────────────────────────────────────────────┐
│         RETROSYNTHESIS QUICK REF          │
├────────────────────────────────────────────┤
│ Input:  SMILES or Structure File          │
│ Models: NeuralSym (best), RetroStar,      │
│         Seq2Seq, Graph2Graph              │
│ Score:  90+ = Great, 80-89 = Good,        │
│         70-79 = Fair, <70 = Difficult     │
│ Time:   Simple ~30s, Complex ~5min        │
│ Export: JSON, CSV, PDF, SMILES            │
├────────────────────────────────────────────┤
│ PRO TIPS:                                  │
│ • Start with known molecules               │
│ • Try different models                     │
│ • Compare multiple pathways                │
│ • Export results for records               │
│ • Share with team                          │
└────────────────────────────────────────────┘
```

---

**Ready to try it?** 🚀

Open ComputeLab → Click "Retrosynthesis" → Enter SMILES → Generate!

**Version:** 0.2.0  
**Last Updated:** October 27, 2025