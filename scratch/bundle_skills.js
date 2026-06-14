const fs = require('fs');
const path = require('path');

const skillsDir = 'e:/Invester/scratch/superpowers/skills';
const outputFile = 'e:/Invester/.gemini/skills/superpowers_combined.md';

const dirs = fs.readdirSync(skillsDir);
let combinedContent = '# Superpowers Consolidated Skills\n\n';
combinedContent += 'This file contains all the skills from the obra/superpowers repository, combined for easy loading as a single skill file.\n\n';

for (const dir of dirs) {
    const fullDirPath = path.join(skillsDir, dir);
    if (fs.statSync(fullDirPath).isDirectory()) {
        const skillFile = path.join(fullDirPath, 'skill.md');
        if (fs.existsSync(skillFile)) {
            const content = fs.readFileSync(skillFile, 'utf8');
            combinedContent += `--- \n## Skill: ${dir}\n---\n\n`;
            combinedContent += content + '\n\n';
        }
    }
}

// ensure directory exists
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, combinedContent, 'utf8');
console.log('Successfully combined skills into:', outputFile);
