<h1>XAudioJS</h1>
<h3>A minimal cross-browser API for writing PCM audio samples:</h3>
<p>This simple JavaScript library abstracts the push-for-audio API of Mozilla Audio, and the passive callback API of Web Audio.
This library introduces an abstraction layer that provides a push-for-audio and a callback API in one. We even provide a flash fallback to bring us to a total of 3 APIs supported.</p>
<br>
<b>This software is hereby placed in the public domain for anyone to use.</b>
<br>
<h3>How To Initialize:</h3>
<dl>
	<dt>new XAudioServer(int channels, double sampleRate, int bufferLow, int bufferHigh, function underRunCallback, function heartbeatCallback, function postheartbeatCallback, double volume, function failureCallback, object userEventLatch);</dt>
		<dd>Make sure only one instance of XAudioServer is running at any time.</dd>
		<dd>bufferLow MUST be less than bufferHigh.</dd>
		<dd>bufferHigh sets the internal FIFO buffer length for all APIs except the Mozilla Audio Data API. Overfill on FIFO causes the oldest samples to be dropped first.</dd>
		<dd>
			<h4>Array underRunCallback (int samplesRequested)</h4>
			<blockquote>
				Arguments: Passed the number of samples that are needed to replenish the internal audio buffer back to bufferLow.<br><br>
				Functionality: JS developer set callback that can pass back any number of samples to replenish the audio buffer with.<br><br>
				Return: Array of samples to be passed into the underlying audio buffer. MUST be divisible by number of channels used (Whole frames required.). The return array length DOES NOT NEED to be of length samplesRequested.
			</blockquote>
		</dd>
        <dd>
            <h4>void heartbeatCallback (void)</h4>
            <blockquote>
                Functionality: JS developers set this callback as a way to program against an audio clock, firing inside an audio event.
            </blockquote>
        </dd>
        <dd>
            <h4>void postheartbeatCallback (void)</h4>
            <blockquote>
                Functionality: JS developers set this callback as a way to program against an audio clock, firing immediately after an audio event.
            </blockquote>
        </dd>
		<dd>volume is the output volume.</dd>
		<dd>
			<h4>void failureCallback (void)</h4>
			<blockquote>
				Functionality: JS developers set this callback to handle no audio support being available from the browser.
			</blockquote>
		</dd>
		<dd>
			<h4>object userEventLatch</h4>
			<blockquote>
				Functionality: JS developers set this DOM object for the Web Audio API to enable audio from.
			</blockquote>
		</dd>
</dl>
<h3>Function Reference:</h3>
<dl>
	<dt>void writeAudio (Array buffer, Integer upTo)</dt>
		<dd>Arguments: Pass an array of audio samples that is divisible by the number of audio channels utilized (buffer % channels == 0), and an integer length delimiter that follows the same restriction.</dd>
		<dd>Functionality: Passes the audio samples directly into the underlying audio subsystem, <b>and can call the specified sample buffer under-run callback as needed (Does the equivalent of executeCallback in addition to the forced sample input.)<b>.</dd>
		<dd>Return: void (None).</dd>
	<dt>void writeAudioNoCallback (Array buffer, Integer upTo)</dt>
		<dd>Arguments: Pass an array of audio samples that is divisible by the number of audio channels utilized (buffer % channels == 0), and an integer length delimiter that follows the same restriction.</dd>
		<dd>Functionality: Passes the audio samples directly into the underlying audio subsystem.</dd>
		<dd>Return: void (None).</dd>
	<dt>int remainingBuffer (void)</dt>
		<dd>Arguments: void (None).</dd>
		<dd>Functionality: Returns the number of samples left in the audio system before running out of playable samples.</dd>
		<dd>Return (On valid): int samples_remaining (<b>CAN BE NEGATIVE<b>)</dd>
		<dd>Return (On invalid): null</dd>
	<dt>void executeCallback (void)</dt>
		<dd>Arguments: void (None).</dd>
		<dd>Functionality: Executes the audio sample under-run callback if the samples remaining is below the set buffer low limit.</dd>
		<dd>Return: void (None).</dd>
	<dt>void changeVolume (double volume)</dt>
		<dd>Arguments: double float between 0 and 1 specifying the volume.</dd>
		<dd>Functionality: Changes the volume. Will affect samples in buffer, so has a low-latency effect (Use this to do a fast-mute).</dd>
		<dd>Return: void (None).</dd>
</dl>