# YouTube AI Buzzword Bingo 🎯

A web application that tracks buzzwords in AI model launch videos and live streams, creating a real-time scorecard for common AI/ML terminology and marketing speak.

## Features

- **YouTube Integration**: Supports regular YouTube videos and live streams
- **Real-time Transcription**: Uses Web Speech API for live audio transcription
- **Buzzword Detection**: Tracks 80+ predefined AI/ML buzzwords plus custom additions
- **Live Counter Updates**: Real-time updates as buzzwords are detected
- **Custom Buzzwords**: Add your own buzzwords to track
- **Export Results**: Download results as JSON or copy to clipboard
- **Responsive Design**: Works on desktop and mobile devices
- **Demo Mode**: Simulated transcription for testing and demonstration

## Buzzword Categories

### AI/ML Technical Terms

- transformer, neural network, deep learning, parameters, tokens
- inference, fine-tuning, RLHF, few-shot, zero-shot, multimodal
- reasoning, emergent, scaling, alignment, hallucination

### Marketing Buzzwords

- revolutionary, breakthrough, game-changing, unprecedented
- cutting-edge, state-of-the-art, industry-leading, disruptive

### Performance Claims

- faster, accurate, reliable, superior, optimized, efficient
- smartest, most advanced, frontier, benchmark

### User-Specified Examples

- excited, frontier, smartest, agent, accurate, faster
- reliable, most advanced, agi, benchmark

## How to Use

1. **Enter YouTube URL**: Paste any YouTube video or live stream URL
2. **Start Tracking**: Click "Start Tracking" to load the video
3. **Play Video**: Start the video to begin transcription
4. **Watch Counters**: Buzzword counters update in real-time
5. **Add Custom Words**: Use the input field to add custom buzzwords
6. **Export Results**: Download your buzzword bingo results

## Technical Implementation

### Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Transcription**: Web Speech API with fallback to demo mode
- **YouTube Integration**: YouTube IFrame API
- **Deployment**: Optimized for Vercel static hosting

### Browser Support

- **Full Features**: Chrome, Edge (Web Speech API support)
- **Limited Features**: Firefox, Safari (demo mode only)
- **Mobile**: iOS Safari, Chrome Mobile (limited transcription)

### Transcription Methods

1. **Web Speech API**: Real-time browser-based speech recognition
2. **Demo Mode**: Simulated transcription for testing/demonstration
3. **Future**: YouTube auto-captions integration (requires backend)

## Deployment

### Deploy to Vercel

1. **Clone/Download** this repository
2. **Install Vercel CLI**: `npm i -g vercel`
3. **Deploy**: Run `vercel` in the project directory
4. **Custom Domain**: Configure in Vercel dashboard (optional)

### Manual Deployment

1. Upload all files to any static hosting service
2. Ensure HTTPS is enabled (required for Web Speech API)
3. Configure CORS headers if needed

### Local Development

1. **Simple Server**: `python -m http.server 8000` or `npx serve`
2. **Live Server**: Use VS Code Live Server extension
3. **Access**: Open `http://localhost:8000` in browser

## File Structure

```
youtube-buzzword-bingo/
├── index.html          # Main HTML structure
├── styles.css          # Responsive CSS styling
├── script.js           # Main application logic
├── buzzwords.js        # Buzzword management and detection
├── transcription.js    # Speech recognition service
├── vercel.json         # Vercel deployment configuration
└── README.md           # This documentation
```

## Configuration

### Adding Default Buzzwords

Edit the `DEFAULT_BUZZWORDS` array in [`buzzwords.js`](buzzwords.js):

```javascript
const DEFAULT_BUZZWORDS = [
  "your-buzzword",
  "another-buzzword",
  // ... more buzzwords
];
```

### Customizing Transcription

Modify transcription settings in [`transcription.js`](transcription.js):

```javascript
this.recognition.continuous = true; // Continuous recognition
this.recognition.interimResults = true; // Show interim results
this.recognition.lang = "en-US"; // Language setting
```

## API Integration

### YouTube IFrame API

The application uses the YouTube IFrame API for video embedding:

- Automatic player state detection
- Play/pause transcription control
- Video loading and error handling

### Web Speech API

Browser-based speech recognition:

- Continuous listening mode
- Interim and final result processing
- Error handling and recovery

## Limitations

### Browser Limitations

- **Web Speech API**: Chrome/Edge only for full functionality
- **HTTPS Required**: Speech recognition requires secure context
- **Microphone Access**: User must grant permission

### YouTube Limitations

- **CORS Restrictions**: Cannot directly access video audio
- **Auto-captions**: Requires backend service for API access
- **Live Streams**: Transcription depends on browser microphone

### Transcription Accuracy

- **Background Noise**: May affect recognition accuracy
- **Multiple Speakers**: May miss some speech
- **Technical Terms**: Some AI buzzwords may not be recognized perfectly

## Future Enhancements

### Planned Features

- [ ] YouTube auto-caption integration
- [ ] Multiple language support
- [ ] Buzzword trend analysis
- [ ] Team/multiplayer mode
- [ ] Historical data storage
- [ ] Advanced export formats (CSV, PDF)

### Technical Improvements

- [ ] Backend service for YouTube captions
- [ ] WebSocket for real-time multiplayer
- [ ] Progressive Web App (PWA) features
- [ ] Offline mode support
- [ ] Advanced audio processing

## Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## License

MIT License - feel free to use and modify for your projects.

## Support

For issues or questions:

1. Check browser compatibility
2. Ensure HTTPS is enabled
3. Grant microphone permissions
4. Try demo mode for testing

---

**Built for tracking AI launch event buzzwords** • Perfect for AI conferences, product launches, and tech presentations!
