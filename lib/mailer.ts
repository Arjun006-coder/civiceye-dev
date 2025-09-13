// Resend-backed mailer (falls back to console log if key missing)
export interface MailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendMail(options: MailOptions): Promise<void> {
  const useGmail = true
  if (useGmail) {
    const user = process.env.GMAIL_USER || 'arjunagrawal665@gmail.com'
    const pass = process.env.GMAIL_APP_PASSWORD || ''
    if (!user || !pass) {
      console.log('[MAIL DEV STUB - GMAIL CREDS MISSING] To:', options.to, 'Subject:', options.subject)
      return
    }
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
    try {
      // Add dashboard link to HTML if it's a resolution notification
      let html = options.html || options.text
      if (options.subject.includes('resolved') || options.subject.includes('verification')) {
        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
        const linkHtml = `<br><br><a href="${dashboardUrl}/user_dashboard" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard to Vote</a>`
        html = (html || '') + linkHtml
      }
      
      await transporter.sendMail({
        from: user,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: html,
      })
    } catch (e) {
      console.error('Email send failed:', e)
    }
    return
  }
}


