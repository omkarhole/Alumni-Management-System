const { StreamSession } = require('../models/Index');

function generateMeetingLinkMock({ platform, eventId }) {
  // Mock placeholders for now.
  // Replace with real Zoom/Meet API integration later.
  const meetingId = `mock-${eventId.toString().slice(-6)}-${Date.now()}`;
  if (platform === 'zoom') {
    return {
      meetingUrl: `https://zoom.us/j/${meetingId}`,
      meetingPassword: 'mock-password',
      streamKey: `mock-streamkey-${meetingId}`,
    };
  }

  if (platform === 'google_meet') {
    return {
      meetingUrl: `https://meet.google.com/${meetingId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
      meetingPassword: '',
      streamKey: `mock-streamkey-${meetingId}`,
    };
  }

  return {
    meetingUrl: `https://example.com/stream/${meetingId}`,
    meetingPassword: '',
    streamKey: `mock-streamkey-${meetingId}`,
  };
}

async function createStreamSession(req, res, next) {
  try {
    const { eventId, platform = 'custom' } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'eventId is required' });
    }

    // Optional: if there is an existing active session, end it first.
    const existing = await StreamSession.findOne({ eventId, status: 'active' });
    if (existing) {
      existing.status = 'ended';
      await existing.save();
    }

    const generated = generateMeetingLinkMock({ platform, eventId });

    const session = await StreamSession.create({
      eventId,
      platform,
      meetingUrl: generated.meetingUrl,
      meetingPassword: generated.meetingPassword,
      streamKey: generated.streamKey,
      status: 'active',
    });

    res.status(201).json({
      message: 'Stream session created',
      session,
    });
  } catch (err) {
    next(err);
  }
}

async function getStreamUrl(req, res, next) {
  try {
    const { eventId } = req.params;

    const session = await StreamSession.findOne({ eventId, status: 'active' });

    if (!session) {
      return res.status(404).json({ message: 'No active stream session found for this event' });
    }

    res.json({
      platform: session.platform,
      meetingUrl: session.meetingUrl,
      meetingPassword: session.meetingPassword,
      streamSessionId: session._id,
    });
  } catch (err) {
    next(err);
  }
}

async function endStream(req, res, next) {
  try {
    const { eventId } = req.params;

    const session = await StreamSession.findOne({ eventId, status: 'active' });

    if (!session) {
      return res.status(404).json({ message: 'No active stream session found to end' });
    }

    session.status = 'ended';
    await session.save();

    res.json({ message: 'Stream ended', session });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createStreamSession,
  getStreamUrl,
  endStream,
  // exported for tests / future real integrations
  generateMeetingLinkMock,
};

