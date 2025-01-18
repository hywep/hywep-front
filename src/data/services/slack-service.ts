export async function sendSlackMessage(message: string) {
    const payload = {text: message};

    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Slack API error:', errorData);
            return;
        }

        console.log('Slack message sent successfully');
    } catch (error) {
        console.error('Error sending Slack message:', error);
    }
}

