const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../database');

const router = express.Router();

// Get all email templates
router.get('/email-templates', async (req, res) => {
  try {
    const templates = await all('SELECT * FROM email_templates ORDER BY type');
    const result = {};
    templates.forEach(template => {
      result[template.type] = {
        subject: template.subject,
        body: template.body
      };
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

// Update email templates
router.post('/email-templates', async (req, res) => {
  try {
    const templates = req.body;
    const updates = [];

    for (const [type, template] of Object.entries(templates)) {
      updates.push(
        run(
          'INSERT OR REPLACE INTO email_templates (id, type, subject, body, updated_at) VALUES (?, ?, ?, ?, datetime("now"))',
          [uuidv4(), type, template.subject, template.body]
        )
      );
    }

    await Promise.all(updates);
    res.json({ message: 'Email templates updated successfully' });
  } catch (error) {
    console.error('Error updating email templates:', error);
    res.status(500).json({ error: 'Failed to update email templates' });
  }
});

module.exports = router;