import nodemailer from 'nodemailer'
import { ENV } from './env.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logoPathCandidates = [
  path.resolve(__dirname, '../../frontend/src/assets/CompanyLogo.png'),
  path.resolve(process.cwd(), 'frontend/src/assets/CompanyLogo.png')
]

const loadLogoImage = () => {
  for (const candidatePath of logoPathCandidates) {
    try {
      if (fs.existsSync(candidatePath)) {
        return fs.readFileSync(candidatePath)
      }
    } catch {
      continue
    }
  }

  return null
}

const logoBuffer = loadLogoImage()
const logoDataUri = logoBuffer ? `data:image/png;base64,${logoBuffer.toString('base64')}` : null

// Initialize SMTP transporter
const hasSmtpCredentials = Boolean(ENV.SMTP_USER && (ENV.SMTP_PASSWORD || ENV.SMTP_PASS))

const transporter = hasSmtpCredentials
  ? nodemailer.createTransport({
      host: ENV.SMTP_HOST || 'smtp.gmail.com',
      port: Number(ENV.SMTP_PORT || 587),
      secure: Number(ENV.SMTP_PORT || 587) === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASSWORD || ENV.SMTP_PASS
      }
    })
  : null

// Verify transporter connection
if (transporter) {
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP Connection Error:', error)
    } else {
      console.log('✓ SMTP Service Ready')
    }
  })
} else {
  console.warn('SMTP is not configured. OTP and welcome emails will be skipped until credentials are added.')
}

export const sendOtpEmail = async (email, otp) => {
  try {
    if (!transporter) {
      return { success: false, error: 'SMTP is not configured' }
    }

    const mailOptions = {
      from: ENV.MAIL_FROM || ENV.SMTP_USER,
      to: email,
      subject: 'Your CampusKart OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">CampusKart</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">OTP Verification</p>
          </div>
          
          <div style="padding: 40px 20px; background: #f5f5f5; text-align: center;">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Your OTP for authentication is:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px;">${otp}</h2>
            </div>
            <p style="color: #888; font-size: 14px; margin: 20px 0 0 0;">This OTP will expire in 10 minutes</p>
          </div>
          
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; border-radius: 0 0 10px 10px; color: #888; font-size: 12px; text-align: center;">
            <p style="margin: 0;">Do not share this code with anyone. We will never ask for your OTP.</p>
            <p style="margin: 8px 0 0 0;">© 2026 CampusKart. All rights reserved.</p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✓ OTP Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('✗ Failed to send OTP email:', error)
    return { success: false, error: error.message }
  }
}

export const sendWelcomeEmail = async (email, name) => {
  try {
    if (!transporter) {
      return { success: false, error: 'SMTP is not configured' }
    }

    const mailOptions = {
      from: ENV.MAIL_FROM || ENV.SMTP_USER,
      to: email,
      subject: 'Welcome to CampusKart',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome ${name}!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f5f5f5;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Thank you for joining <strong>CampusKart</strong>. Your account has been successfully created.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 20px;">
              You can now start shopping from our premium collection of products curated for students.
            </p>
            
            <a href="${ENV.FRONTEND_URL || 'http://localhost:5173'}/product" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Start Shopping
            </a>
          </div>
          
          <div style="padding: 20px; background: #f5f5f5; border-top: 1px solid #ddd; border-radius: 0 0 10px 10px; color: #888; font-size: 12px; text-align: center;">
            <p style="margin: 0;">© 2026 CampusKart. All rights reserved.</p>
          </div>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✓ Welcome email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('✗ Failed to send welcome email:', error)
    return { success: false, error: error.message }
  }
}

const formatCurrency = (value) => {
  const amount = Number(value || 0)
  return `Rs. ${amount.toFixed(2)}`
}

const formatDate = (dateValue) => {
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime())
    ? 'N/A'
    : date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const sendOrderConfirmationEmail = async ({
  to,
  customerName,
  orderId,
  paymentMethod,
  paymentStatus,
  orderedAt,
  estimatedDeliveryDate,
  products,
  totalAmount,
  pdfBuffer
}) => {
  try {
    if (!transporter) {
      return { success: false, error: 'SMTP is not configured' }
    }

    const safeProducts = Array.isArray(products) ? products : []
    const productsTableRows = safeProducts
      .map((item, index) => {
        const qty = Number(item.quantity || 0)
        const price = Number(item.price || 0)
        const rowTotal = qty * price
        return `
          <tr>
            <td style="padding:10px;border:1px solid #e2e8f0;">${index + 1}</td>
            <td style="padding:10px;border:1px solid #e2e8f0;">${item.name || 'Product'}</td>
            <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;">${qty}</td>
            <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(price)}</td>
            <td style="padding:10px;border:1px solid #e2e8f0;text-align:right;">${formatCurrency(rowTotal)}</td>
          </tr>
        `
      })
      .join('')

    const statusTone = paymentStatus === 'Paid' ? '#16a34a' : '#f59e0b'
    const statusBg = paymentStatus === 'Paid' ? 'rgba(22,163,74,0.10)' : 'rgba(245,158,11,0.12)'

    const logoMarkup = logoDataUri
      ? `<img src="${logoDataUri}" alt="CampusKart" style="width:74px;height:74px;border-radius:18px;object-fit:cover;background:#fff;border:2px solid rgba(255,255,255,0.28);box-shadow:0 14px 30px rgba(15,23,42,0.16);padding:6px;" />`
      : `<div style="width:74px;height:74px;border-radius:18px;background:#fff;color:#0f172a;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:26px;border:2px solid rgba(255,255,255,0.28);box-shadow:0 14px 30px rgba(15,23,42,0.16);">C</div>`

    const html = `
      <div style="margin: 0; padding: 24px; background: linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%);">
        <div style="font-family: Inter, Arial, sans-serif; max-width: 720px; margin: 0 auto; color: #0f172a; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 70px rgba(15, 23, 42, 0.14); border: 1px solid #dbeafe; background: #fff;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #06b6d4 100%); color: white; padding: 28px; position: relative;">
            <div style="position:absolute; inset:0; background: radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 26%), radial-gradient(circle at bottom left, rgba(255,255,255,0.10), transparent 24%);"></div>
            <div style="position: relative; display:flex; align-items:center; justify-content:space-between; gap:16px;">
              <div>
                <div style="display:inline-flex; align-items:center; gap:10px; border:1px solid rgba(255,255,255,0.22); border-radius:999px; padding:8px 14px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase;">
                  <span style="height:10px;width:10px;border-radius:999px;background:#22c55e;display:inline-block;"></span>
                  CampusKart Order Confirmed
                </div>
                <h1 style="margin: 16px 0 6px; font-size: 28px; line-height: 1.15;">Thanks for your order, ${customerName || 'Customer'}</h1>
                <p style="margin: 0; font-size: 14px; opacity: 0.92; max-width: 520px;">Your checkout is complete. We have attached a beautifully formatted invoice PDF and outlined the order details below.</p>
              </div>
              <div style="min-width: 120px; text-align:center;">
                <div style="display:inline-flex; align-items:center; justify-content:center; width:88px; height:88px; border-radius:28px; background: linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06)); border:2px solid rgba(255,255,255,0.24); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 18px 40px rgba(15,23,42,0.20); position:relative;">
                  ${logoMarkup}
                </div>
              </div>
            </div>
          </div>

          <div style="padding: 24px; background: #ffffff;">
            <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px;">
              <div style="border:1px solid #e2e8f0; border-radius:18px; padding:14px 16px; background: linear-gradient(180deg,#fff,#f8fafc);">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.18em;">Order ID</div>
                <div style="margin-top: 6px; font-weight: 700; font-size: 14px; word-break: break-all;">${orderId}</div>
              </div>
              <div style="border:1px solid #e2e8f0; border-radius:18px; padding:14px 16px; background: linear-gradient(180deg,#fff,#f8fafc);">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.18em;">Payment</div>
                <div style="margin-top: 6px; font-weight: 700; font-size: 14px;">${paymentMethod} · ${paymentStatus}</div>
              </div>
              <div style="border:1px solid #e2e8f0; border-radius:18px; padding:14px 16px; background: linear-gradient(180deg,#fff,#f8fafc);">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.18em;">Order Date</div>
                <div style="margin-top: 6px; font-weight: 700; font-size: 14px;">${formatDate(orderedAt)}</div>
              </div>
              <div style="border:1px solid #e2e8f0; border-radius:18px; padding:14px 16px; background: linear-gradient(180deg,#fff,#f8fafc);">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.18em;">Delivery</div>
                <div style="margin-top: 6px; font-weight: 700; font-size: 14px;">${formatDate(estimatedDeliveryDate)}</div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; gap: 12px; border:1px solid #dbeafe; border-radius: 18px; padding: 16px 18px; background: linear-gradient(135deg, #eff6ff, #f8fafc); margin-bottom: 18px;">
              <div>
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.18em;">Total Amount</div>
                <div style="margin-top: 6px; font-size: 22px; font-weight: 800; color: #0f172a;">${formatCurrency(totalAmount)}</div>
              </div>
              <div style="padding: 8px 14px; border-radius: 999px; background: ${statusBg}; color: ${statusTone}; font-size: 13px; font-weight: 700; border: 1px solid rgba(0,0,0,0.05);">
                ${paymentStatus}
              </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 18px;">
              <div style="padding: 12px; border-radius: 16px; background: linear-gradient(180deg,#f8fafc,#fff); border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.16em;">Support</div>
                <div style="margin-top:6px; font-size:13px; font-weight:700;">Fast help</div>
              </div>
              <div style="padding: 12px; border-radius: 16px; background: linear-gradient(180deg,#f8fafc,#fff); border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.16em;">Tracking</div>
                <div style="margin-top:6px; font-size:13px; font-weight:700;">Easy updates</div>
              </div>
              <div style="padding: 12px; border-radius: 16px; background: linear-gradient(180deg,#f8fafc,#fff); border:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.16em;">Invoice</div>
                <div style="margin-top:6px; font-size:13px; font-weight:700;">PDF attached</div>
              </div>
            </div>

            <div style="border:1px solid #e2e8f0; border-radius: 20px; overflow:hidden;">
              <div style="display:flex; align-items:center; justify-content:space-between; padding: 14px 18px; background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: white;">
                <div style="font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px;">Items</div>
                <div style="font-size: 12px; opacity: 0.92;">Qty / Price / Total</div>
              </div>
              <div style="padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f8fafc; color: #334155;">
                      <th style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align:left; font-size: 12px;">#</th>
                      <th style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align:left; font-size: 12px;">Product</th>
                      <th style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align:right; font-size: 12px;">Qty</th>
                      <th style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align:right; font-size: 12px;">Price</th>
                      <th style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align:right; font-size: 12px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productsTableRows || '<tr><td colspan="5" style="padding:14px; text-align:center; color:#64748b;">No item details available.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>

            <div style="margin-top: 18px; display:flex; gap: 12px; flex-wrap: wrap;">
              <a href="${ENV.FRONTEND_URL || 'http://localhost:5173'}/orders" style="display:inline-block; padding: 12px 18px; border-radius: 14px; background: linear-gradient(135deg, #1d4ed8, #06b6d4); color:white; text-decoration:none; font-weight:700;">View Orders</a>
              <a href="${ENV.FRONTEND_URL || 'http://localhost:5173'}/product" style="display:inline-block; padding: 12px 18px; border-radius: 14px; background: #eff6ff; color:#1d4ed8; text-decoration:none; font-weight:700; border:1px solid #bfdbfe;">Continue Shopping</a>
            </div>

            <p style="margin: 18px 0 0; color: #475569; font-size: 13px; line-height: 1.6;">Need help? Just reply to this email and our support team will assist you. Your invoice PDF is attached for a cleaner record of the order.</p>
          </div>
          <div style="padding: 14px 24px; background: linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%); color: white; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
            <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;">CampusKart</div>
            <div style="font-size: 12px; opacity: 0.92;">Campus commerce • premium checkout • order assistance</div>
          </div>
        </div>
      </div>
    `

    const mailOptions = {
      from: ENV.MAIL_FROM || ENV.SMTP_USER,
      to,
      subject: `CampusKart Order Confirmed - ${orderId}`,
      html,
      attachments: pdfBuffer
        ? [
            {
              filename: `${orderId}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        : []
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✓ Order confirmation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('✗ Failed to send order confirmation email:', error)
    return { success: false, error: error.message }
  }
}

export default transporter
