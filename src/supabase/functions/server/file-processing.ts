import { Hono } from "npm:hono";

const app = new Hono();

// Helper to extract text from different file types
async function extractTextFromFile(file: File): Promise<{ title: string; body: string }> {
  const fileName = file.name;
  const fileType = fileName.split('.').pop()?.toLowerCase();
  
  let extractedText = '';
  let title = '';

  try {
    if (fileType === 'txt') {
      // Plain text file
      extractedText = await file.text();
    } else if (fileType === 'pdf') {
      // PDF - use pdf-parse library
      const pdfParse = (await import('npm:pdf-parse@1.1.1')).default;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (fileType === 'doc' || fileType === 'docx') {
      // Word document - basic text extraction
      // For now, just read as text (docx are XML-based)
      const text = await file.text();
      // Try to extract text from XML structure
      const textMatch = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (textMatch) {
        extractedText = textMatch.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
      } else {
        extractedText = text;
      }
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Process extracted text
    const lines = extractedText.split('\n').filter(line => line.trim());
    
    // Try to extract title from first line
    if (lines.length > 0 && lines[0].trim().length < 100) {
      title = lines[0].trim();
      extractedText = lines.slice(1).join('\n').trim();
    } else {
      // Use filename as title
      title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }

    return {
      title,
      body: extractedText.trim()
    };
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

// Process uploaded file
app.post('/make-server-66fdb7c0/process-file', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const result = await extractTextFromFile(file);
    
    return c.json({
      success: true,
      title: result.title,
      body: result.body,
      fileName: file.name,
      fileSize: file.size
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to process file',
      success: false
    }, 500);
  }
});

export default app;
