import PDFDocument from 'pdfkit';
import  {Buffer} from 'buffer';

/**
 * Utilitaire de génération de documents PDF pour le système de restauration.
 * Gère l'export des QR Codes, les tickets de caisse et les reçus.
 * Note: Nécessite 'npm install pdfkit buffer' et 'npm install -D @types/pdfkit @types/node'
 */
export class PdfUtils {
  /**
   * Génère un document A5 moderne et élégant avec le QR Code d'une table.
   */
  static async generateTableQRCodePDF(
    table: any, 
    restaurantName: string = 'VOTRE RESTAURANT',
    options?: {
      primaryColor?: string;
      showInstructions?: boolean;
      dualLanguage?: boolean;
      logoBuffer?: Buffer;
    }
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: 'A5', 
        margin: 30,
        layout: 'portrait'
      });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      let currentY = doc.y;

      // 1. Cadre extérieur élégant
      doc.rect(15, 15, pageWidth - 30, doc.page.height - 30)
         .lineWidth(0.5)
         .stroke('#E0E0E0');

      // 2. En-tête
      doc.moveDown(2);
      
      if (options?.logoBuffer) {
        doc.image(options.logoBuffer, (pageWidth - 60) / 2, doc.y, { width: 60 });
        doc.moveDown(3.5);
      }
      
      doc.fontSize(22)
         .font('Helvetica-Bold')
         .fillColor('#1A1A1A')
         .text(restaurantName.toUpperCase(), { 
           align: 'center', 
           characterSpacing: 2 
         });
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#7F8C8D')
         .text('MENU DIGITAL', { 
           align: 'center', 
           characterSpacing: 4 
         });

      doc.moveDown(1.5);
      currentY = doc.y;

      // 3. QR Code (avec fond de sécurité)
      if (table.qrCodeImage) {
        const qrSize = 200; 
        const x = (pageWidth - qrSize) / 2;
        
        doc.rect(x - 10, currentY - 10, qrSize + 20, qrSize + 20)
           .fill('#FFFFFF');
        
        doc.image(table.qrCodeImage, x, doc.y, { width: qrSize });
        doc.y = currentY + qrSize + 20;
      } else {
        doc.moveDown(4);
        doc.fontSize(10).fillColor('#E74C3C').text('⚠️ QR Code non généré', { align: 'center' });
        doc.moveDown(4);
      }

      // 4. Identification de la table
      doc.moveDown(1);
      doc.fontSize(11).font('Helvetica').fillColor('#7F8C8D').text('TABLE', { align: 'center', characterSpacing: 3 });
      doc.fontSize(42).font('Helvetica-Bold').fillColor('#1A1A1A').text(table.number.toString(), { align: 'center' });

      if (table.name && table.name !== `Table ${table.number}`) {
        doc.fontSize(14).font('Helvetica').fillColor('#555555').text(table.name, { align: 'center' });
      }

      // 5. Instructions de scan
      if (options?.showInstructions !== false) {
        doc.moveDown(1.5);
        doc.fontSize(9).font('Helvetica').fillColor('#666666');
        
        if (options?.dualLanguage) {
          doc.text('1. Scannez le QR code avec votre smartphone', { align: 'center' });
          doc.text('2. Accédez au menu interactif', { align: 'center' });
          doc.moveDown(0.5);
          doc.font('Helvetica-Oblique').text('Scan to view our digital menu', { align: 'center' });
        } else {
          doc.text('📱 Scannez ce QR code', { align: 'center' });
          doc.text('pour accéder au menu interactif', { align: 'center' });
        }
      }

      // 6. Message final et pied de page
      doc.moveDown(2.5);
      doc.fontSize(16).font('Helvetica-Oblique').fillColor('#2C3E50').text('Bon appétit !', { align: 'center' });

      doc.fontSize(7).font('Helvetica').fillColor('#BDC3C7').text(
        'Service non compris • Menu modifiable sans préavis', 
        0, doc.page.height - 45, { align: 'center' }
      );

      doc.end();
    });
  }

  /**
   * Version simplifiée pour stickers (format carré 10x10 cm).
   */
  static async generateStickerQRCodePDF(table: any, restaurantName: string = 'VOTRE RESTAURANT'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: [283, 283], margin: 15 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      if (table.qrCodeImage) {
        doc.image(table.qrCodeImage, (doc.page.width - 180) / 2, 20, { width: 180 });
      }
      doc.moveDown(12);
      doc.fontSize(10).font('Helvetica-Bold').text(`TABLE ${table.number}`, { align: 'center' });
      doc.fontSize(7).font('Helvetica').text(restaurantName, { align: 'center' });
      doc.end();
    });
  }

  /**
   * Génère un ticket de caisse ou un reçu de vente.
   * Format adapté aux imprimantes thermiques standards (80mm).
   */
  static async generateTicketPDF(data: {
    order?: any;
    sale?: any;
    payments?: any[];
    restaurant: any;
    logo?: Buffer;
    content?: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: [226, 600], 
        margin: 10,
        layout: 'portrait'
      }); 
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      let { order, sale, payments, restaurant, logo, content } = data;

      // Support Retail JSON: Si content contient du JSON (structure brute retail), on décode pour le PDF structuré
      if (content && content.trim().startsWith('{') && (!order || !order.items)) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.items && Array.isArray(parsed.items)) {
            order = {
              items: parsed.items,
              totalAmount: parsed.total || parsed.totalAmount || 0,
              subtotal: parsed.subtotal || parsed.total || 0,
              taxAmount: parsed.taxAmount || 0,
              tableNumber: parsed.cartNumber ? 'BOUTIQUE' : undefined
            };
            if (!sale && parsed.cartNumber) sale = { saleNumber: parsed.cartNumber };
          }
        } catch (e) { /* Pas du JSON valide, on laisse le traitement textuel brut */ }
      }

      // Retail ou Reçu textuel : on affiche le contenu brut si présent et pas d'items structurés
      if (content && (!order || !order.items || order.items.length === 0)) {
        if (logo) {
          doc.image(logo, (226 - 40) / 2, 5, { width: 40 });
          doc.moveDown(2);
        }
        doc.font('Courier').fontSize(7.5).text(content, { align: 'left', lineGap: 2 });
        doc.end();
        return;
      }

      if (logo) {
        doc.image(logo, (226 - 40) / 2, 5, { width: 40 });
        doc.moveDown(3);
      }

      doc.fontSize(12).font('Helvetica-Bold').text(restaurant.name.toUpperCase(), { align: 'center' });
      doc.fontSize(7).font('Helvetica').text(restaurant.address || '', { align: 'center' });
      doc.text(`Tél: ${restaurant.phone || '---'}`, { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fontSize(8).text('─'.repeat(35), { align: 'center' });
      
      const ticketType = sale ? 'TICKET DE CAISSE' : 'BON DE COMMANDE';
      doc.fontSize(9).font('Helvetica-Bold').text(ticketType, { align: 'center' });
      
      doc.fontSize(7).font('Helvetica');
      doc.text(`Date: ${new Date().toLocaleString('fr-FR')}`)
         .text(`N°: ${sale?.saleNumber || order?.id?.substring(0, 8)}`)
         .text(`Table: ${order?.tableNumber || 'Emporter'}`);
      
      doc.moveDown(0.5);
      doc.text('─'.repeat(35), { align: 'center' });
      
      doc.moveDown(0.3);
      doc.fontSize(7).font('Helvetica-Bold')
         .text('Qté  Article', 10, doc.y, { width: 120 })
         .text('Total', 150, doc.y, { width: 45, align: 'right' });
      
      doc.moveDown(0.2);
      doc.font('Helvetica');
      order?.items?.forEach((item: any) => {
        const qty = item.quantity;
        const name = item.product?.name || item.name || item.designation || 'Article';
        const price = Number(item.total) || (Number(item.unitPrice) || Number(item.price) || 0) * qty;
        
        doc.text(`${qty}x   ${name.substring(0, 25)}`, 10, doc.y, { width: 120 })
           .text(`${price.toLocaleString('fr-FR')} F`, 150, doc.y, { width: 45, align: 'right' });
        doc.moveDown(0.2);
      });

      doc.moveDown(0.5);
      doc.text('─'.repeat(35), { align: 'center' });

      const subtotal = order?.subtotal ?? sale?.subtotal ?? order?.totalAmount ?? sale?.totalAmount ?? 0;
      const tax = order?.taxAmount ?? sale?.taxAmount ?? 0;
      const total = order?.totalAmount ?? sale?.totalAmount ?? (subtotal + tax);

      doc.moveDown(0.5);
      doc.text('Sous-total:', 10, doc.y, { width: 90 }).text(`${subtotal.toLocaleString('fr-FR')} F`, 150, doc.y, { width: 45, align: 'right' });
      doc.text('TVA (19.25%):', 10, doc.y, { width: 90 }).text(`${tax.toLocaleString('fr-FR')} F`, 150, doc.y, { width: 45, align: 'right' });
      
      doc.fontSize(9).font('Helvetica-Bold')
         .text('TOTAL:', 10, doc.y, { width: 90 })
         .text(`${total.toLocaleString('fr-FR')} F`, 150, doc.y, { width: 45, align: 'right' });

      if (payments && payments.length > 0) {
        doc.moveDown(0.5);
        doc.fontSize(7).text('─'.repeat(35), { align: 'center' });
        doc.text('PAIEMENTS:', { align: 'center' });
        payments.forEach(p => {
          doc.text(`${p.method}:`, 10, doc.y, { width: 90 })
             .text(`${p.amount.toLocaleString('fr-FR')} F`, 150, doc.y, { width: 45, align: 'right' });
          doc.moveDown(0.2);
        });
      }

      doc.moveDown(1.5);
      doc.fontSize(8).font('Helvetica-Oblique').text('Merci de votre confiance !', { align: 'center' }).text('À bientôt', { align: 'center' });

      doc.end();
    });
  }
}