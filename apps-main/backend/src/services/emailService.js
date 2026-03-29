const nodemailer = require('nodemailer');

let transporter;

function hasEmailConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
}

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  const port = Number(SMTP_PORT || 587);
  const secure = SMTP_SECURE === 'true' || port === 465;

  if (!SMTP_HOST || !SMTP_PORT) {
    throw new Error('Email is not configured. Please set SMTP_HOST and SMTP_PORT.');
  }

  const transportConfig = {
    host: SMTP_HOST,
    port,
    secure,
  };

  if (SMTP_USER && SMTP_PASS) {
    transportConfig.auth = { user: SMTP_USER, pass: SMTP_PASS };
  }

  transporter = nodemailer.createTransport(transportConfig);
  return transporter;
}

function formatMeetingTime(isoTime) {
  const dt = new Date(isoTime);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(dt);
}

async function getEmailTemplate(type) {
  // Temporarily disabled to fix startup issue
  return null;
}

function replaceTemplateVariables(text, variables) {
  return text.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match);
}

async function sendMeetingEmail({ to, subject, text }) {
  if (!hasEmailConfig()) {
    console.warn('Email not sent: SMTP is not configured.');
    return false;
  }

  try {
    const from = process.env.SMTP_FROM;
    const mailer = getTransporter();
    await mailer.sendMail({ from, to, subject, text });
    return true;
  } catch (err) {
    console.error('Failed to send email:', err.message);
    return false;
  }
}

async function sendBookingConfirmationEmail(meeting) {
  const template = await getEmailTemplate('booking_confirmation');

  const variables = {
    invitee_name: meeting.invitee_name,
    event_name: meeting.event_type_name,
    date: formatMeetingTime(meeting.start_time).split(',')[0], // Just the date part
    time: `${formatMeetingTime(meeting.start_time).split(',')[1]} - ${formatMeetingTime(meeting.end_time).split(',')[1]}`,
    location: 'Online', // You can enhance this later
  };

  const subject = template ? replaceTemplateVariables(template.subject, variables) : `Booking confirmed: ${meeting.event_type_name}`;
  const body = template ? replaceTemplateVariables(template.body, variables) : `Hi ${meeting.invitee_name},

Your meeting is confirmed.

Event: ${meeting.event_type_name}
When: ${formatMeetingTime(meeting.start_time)} - ${formatMeetingTime(meeting.end_time)}
Notes: ${meeting.notes || 'N/A'}

Thanks,
Scheduly`;

  await sendMeetingEmail({
    to: meeting.invitee_email,
    subject,
    text: body,
  });
}

async function sendMeetingUpdatedEmail(meeting, previousStart, previousEnd) {
  await sendMeetingEmail({
    to: meeting.invitee_email,
    subject: `Meeting updated: ${meeting.event_type_name}`,
    text: `Hi ${meeting.invitee_name},

Your meeting was updated.

Event: ${meeting.event_type_name}
Previous time: ${formatMeetingTime(previousStart)} - ${formatMeetingTime(previousEnd)}
New time: ${formatMeetingTime(meeting.start_time)} - ${formatMeetingTime(meeting.end_time)}
Notes: ${meeting.notes || 'N/A'}

Thanks,
Scheduly`,
  });
}

async function sendMeetingReminderEmail(meeting) {
  const template = await getEmailTemplate('meeting_reminder');

  const variables = {
    invitee_name: meeting.invitee_name,
    event_name: meeting.event_type_name,
    date: formatMeetingTime(meeting.start_time).split(',')[0],
    time: `${formatMeetingTime(meeting.start_time).split(',')[1]} - ${formatMeetingTime(meeting.end_time).split(',')[1]}`,
    location: 'Online',
  };

  const subject = template ? replaceTemplateVariables(template.subject, variables) : `Reminder: ${meeting.event_type_name} tomorrow`;
  const body = template ? replaceTemplateVariables(template.body, variables) : `Hi ${meeting.invitee_name},

This is a reminder for your upcoming meeting "${meeting.event_type_name}".

When: ${formatMeetingTime(meeting.start_time)} - ${formatMeetingTime(meeting.end_time)}

See you then!

Best regards,
Scheduly Team`;

  await sendMeetingEmail({
    to: meeting.invitee_email,
    subject,
    text: body,
  });
}

async function sendMeetingCancelledEmail(meeting) {
  const template = await getEmailTemplate('booking_cancellation');

  const variables = {
    invitee_name: meeting.invitee_name,
    event_name: meeting.event_type_name,
    date: formatMeetingTime(meeting.start_time).split(',')[0],
    time: `${formatMeetingTime(meeting.start_time).split(',')[1]} - ${formatMeetingTime(meeting.end_time).split(',')[1]}`,
  };

  const subject = template ? replaceTemplateVariables(template.subject, variables) : `Meeting cancelled: ${meeting.event_type_name}`;
  const body = template ? replaceTemplateVariables(template.body, variables) : `Hi ${meeting.invitee_name},

Your meeting has been cancelled.

Event: ${meeting.event_type_name}
Cancelled time: ${formatMeetingTime(meeting.start_time)} - ${formatMeetingTime(meeting.end_time)}

Thanks,
Scheduly`;

  await sendMeetingEmail({
    to: meeting.invitee_email,
    subject,
    text: body,
  });
}

module.exports = {
  sendBookingConfirmationEmail,
  sendMeetingUpdatedEmail,
  sendMeetingCancelledEmail,
  sendMeetingReminderEmail,
};
