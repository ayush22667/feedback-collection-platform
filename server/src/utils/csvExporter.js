const generateCSV = (headers, data) => {
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes in CSV
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

const generateFormResponsesCSV = (form, responses) => {
  const headers = ['Submission Date', ...form.questions.map(q => q.text)];
  
  const csvData = responses.map(response => {
    const row = {
      'Submission Date': new Date(response.createdAt).toISOString()
    };
    
    form.questions.forEach(question => {
      const answer = response.answers.find(a => a.questionId.toString() === question._id.toString());
      if (answer) {
        let value = answer.answer;
        if (Array.isArray(value)) {
          value = value.join('; ');
        }
        row[question.text] = value;
      } else {
        row[question.text] = '';
      }
    });
    
    return row;
  });
  
  return generateCSV(headers, csvData);
};

module.exports = {
  generateCSV,
  generateFormResponsesCSV
};