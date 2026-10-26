import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { ResumeData } from '../types/resume.ts';

function parseBoldRuns(text: string, sizeHalfPt = 21, colorHex = '1E293B'): TextRun[] {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments
    .filter((seg) => seg.length > 0)
    .map((seg) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return new TextRun({
          text: seg.slice(2, -2),
          bold: true,
          size: sizeHalfPt,
          color: colorHex,
          font: 'Calibri',
        });
      }
      return new TextRun({
        text: seg,
        bold: false,
        size: sizeHalfPt,
        color: colorHex,
        font: 'Calibri',
      });
    });
}

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    border: {
      bottom: {
        color: '0D9488',
        space: 4,
        style: BorderStyle.SINGLE,
        size: 8,
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 24,
        color: '0F172A',
        font: 'Calibri',
      }),
    ],
  });
}

export async function exportResumeToDocx(resume: ResumeData): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: resume.fullName,
          bold: true,
          size: 44,
          color: '0F172A',
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: resume.jobTitle,
          bold: true,
          size: 26,
          color: '0D9488',
          font: 'Calibri',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: [
            resume.email,
            resume.phone,
            resume.location,
            resume.linkedin,
            resume.github,
            resume.website,
          ]
            .filter(Boolean)
            .join('  |  '),
          size: 19,
          color: '475569',
          font: 'Calibri',
        }),
      ],
    }),

    sectionHeader('Professional Summary'),
    new Paragraph({
      spacing: { after: 140 },
      children: parseBoldRuns(resume.summary, 21, '1E293B'),
    }),

    sectionHeader('Work Experience'),
  ];

  for (const exp of resume.experiences) {
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({
            text: `${exp.role} — ${exp.company}`,
            bold: true,
            size: 23,
            color: '0F172A',
            font: 'Calibri',
          }),
          new TextRun({
            text: `   (${exp.period}${exp.location ? ` · ${exp.location}` : ''})`,
            italics: true,
            size: 20,
            color: '475569',
            font: 'Calibri',
          }),
        ],
      })
    );
    for (const bullet of exp.bullets) {
      children.push(
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: '◆ ', bold: true, size: 20, color: '0D9488', font: 'Calibri' }),
            ...parseBoldRuns(bullet, 20, '1E293B'),
          ],
        })
      );
    }
  }

  children.push(sectionHeader('Technical Skills'));
  for (const sk of resume.skills) {
    children.push(
      new Paragraph({
        spacing: { after: 50 },
        children: [
          new TextRun({
            text: `${sk.category}: `,
            bold: true,
            size: 20,
            color: '0F172A',
            font: 'Calibri',
          }),
          new TextRun({
            text: sk.items,
            size: 20,
            color: '334155',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  children.push(sectionHeader('Key Projects'));
  for (const proj of resume.projects) {
    children.push(
      new Paragraph({
        spacing: { before: 100, after: 30 },
        children: [
          new TextRun({
            text: `${proj.title} | (${proj.techTag})`,
            bold: true,
            size: 21,
            color: '0F172A',
            font: 'Calibri',
          }),
        ],
      })
    );
    for (const bullet of proj.bullets) {
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '◆ ', bold: true, size: 20, color: '0D9488', font: 'Calibri' }),
            ...parseBoldRuns(bullet, 20, '1E293B'),
          ],
        })
      );
    }
  }

  children.push(sectionHeader('Certifications'));
  for (const cert of resume.certificates) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: `• ${cert.name} (${cert.date})`,
            size: 20,
            color: '1E293B',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  children.push(sectionHeader('Education'));
  for (const edu of resume.education) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: edu.degree,
            bold: true,
            size: 21,
            color: '0F172A',
            font: 'Calibri',
          }),
          new TextRun({
            text: ` — ${edu.institution} (${edu.period})`,
            size: 20,
            color: '475569',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  children.push(sectionHeader('Languages'));
  children.push(
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: resume.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   '),
          size: 20,
          color: '1E293B',
          font: 'Calibri',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = resume.fullName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'ATS_Resume';
  link.href = url;
  link.download = `${safeName}_ATS_Resume.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportCoverLetterToDocx(
  fullName: string,
  email: string,
  phone: string,
  jobTitle: string,
  companyName: string,
  content: string
): Promise<void> {
  const paragraphs = content.split(/\n\n+/).map(
    (para) =>
      new Paragraph({
        spacing: { after: 160 },
        children: parseBoldRuns(para.trim(), 22, '1E293B'),
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: fullName,
                bold: true,
                size: 36,
                color: '0F172A',
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `${email}  |  ${phone}  |  Application for ${jobTitle} at ${companyName}`,
                size: 20,
                color: '475569',
                font: 'Calibri',
              }),
            ],
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = fullName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Candidate';
  link.href = url;
  link.download = `${safeName}_Cover_Letter.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
