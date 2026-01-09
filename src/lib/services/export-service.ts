/**
 * ============================================================================
 * SERVICE D'EXPORT - MyChurchApp
 * ============================================================================
 * Génération de rapports et exports en Excel, PDF et CSV
 * 
 * Fonctionnalités:
 * - Export Excel avec formatage avancé
 * - Export PDF avec mise en page professionnelle
 * - Export CSV pour données brutes
 * - Reçus fiscaux automatiques
 * - Rapports financiers
 * - Rapports de présence
 * - Bulletins automatiques
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * ============================================================================
 */

// Types pour les exports
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  filename: string;
  title?: string;
  subtitle?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'A4' | 'Letter';
}

export interface MemberExportData {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  joinDate: string;
  birthDate?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface DonationExportData {
  id: string;
  date: string;
  memberName: string;
  memberNumber?: string;
  amount: number;
  currency: string;
  type: string;
  paymentMethod: string;
  project?: string;
  reference: string;
  isAnonymous: boolean;
}

export interface AttendanceExportData {
  date: string;
  eventName: string;
  eventType: string;
  totalAttendees: number;
  newVisitors: number;
  members: {
    name: string;
    memberNumber: string;
    checkInTime: string;
    method: string;
  }[];
}

export interface FinancialReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  currency: string;
  incomeByCategory: { category: string; amount: number; percentage: number }[];
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
  donations: DonationExportData[];
}

export interface TaxReceiptData {
  receiptNumber: string;
  year: number;
  donorName: string;
  donorAddress: string;
  donorEmail: string;
  organizationName: string;
  organizationAddress: string;
  organizationTaxId: string;
  donations: {
    date: string;
    amount: number;
    type: string;
  }[];
  totalAmount: number;
  currency: string;
  generatedDate: string;
}

// ============================================================================
// CSV EXPORT SERVICE
// ============================================================================

export class CSVExportService {
  /**
   * Convertir des données en CSV
   */
  static toCSV<T extends Record<string, any>>(
    data: T[],
    headers?: { key: keyof T; label: string }[]
  ): string {
    if (data.length === 0) return '';

    const keys = headers ? headers.map(h => h.key) : Object.keys(data[0]) as (keyof T)[];
    const headerLabels = headers ? headers.map(h => h.label) : keys as string[];

    const csvRows: string[] = [];

    // Header row
    csvRows.push(headerLabels.map(h => `"${h}"`).join(','));

    // Data rows
    for (const row of data) {
      const values = keys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (typeof value === 'boolean') return value ? '"Oui"' : '"Non"';
        return `"${value}"`;
      });
      csvRows.push(values.join(','));
    }

    return '\uFEFF' + csvRows.join('\n'); // BOM for UTF-8
  }

  /**
   * Télécharger un fichier CSV
   */
  static download(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Export des membres en CSV
   */
  static exportMembers(members: MemberExportData[]): string {
    return this.toCSV(members, [
      { key: 'memberNumber', label: 'N° Membre' },
      { key: 'lastName', label: 'Nom' },
      { key: 'firstName', label: 'Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Téléphone' },
      { key: 'role', label: 'Rôle' },
      { key: 'status', label: 'Statut' },
      { key: 'joinDate', label: 'Date d\'adhésion' },
      { key: 'birthDate', label: 'Date de naissance' },
      { key: 'address', label: 'Adresse' },
      { key: 'city', label: 'Ville' },
      { key: 'country', label: 'Pays' },
    ]);
  }

  /**
   * Export des dons en CSV
   */
  static exportDonations(donations: DonationExportData[]): string {
    return this.toCSV(donations, [
      { key: 'date', label: 'Date' },
      { key: 'reference', label: 'Référence' },
      { key: 'memberName', label: 'Donateur' },
      { key: 'memberNumber', label: 'N° Membre' },
      { key: 'amount', label: 'Montant' },
      { key: 'currency', label: 'Devise' },
      { key: 'type', label: 'Type' },
      { key: 'paymentMethod', label: 'Mode de paiement' },
      { key: 'project', label: 'Projet' },
      { key: 'isAnonymous', label: 'Anonyme' },
    ]);
  }
}

// ============================================================================
// EXCEL EXPORT SERVICE (Sans dépendance externe - Format XML Spreadsheet)
// ============================================================================

export class ExcelExportService {
  private static createWorkbookXML(sheets: {
    name: string;
    data: any[][];
    columnWidths?: number[];
    headerStyle?: boolean;
  }[]): string {
    const escapeXML = (str: any): string => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="#,##0.00"/>
   <Alignment ss:Horizontal="Right"/>
  </Style>
  <Style ss:ID="Date">
   <NumberFormat ss:Format="dd/mm/yyyy"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Size="16" ss:Color="#1E40AF"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="Subtitle">
   <Font ss:Italic="1" ss:Size="12" ss:Color="#6B7280"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="Total">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2"/>
   </Borders>
  </Style>
 </Styles>`;

    for (const sheet of sheets) {
      xml += `
 <Worksheet ss:Name="${escapeXML(sheet.name)}">
  <Table>`;

      // Column widths
      if (sheet.columnWidths) {
        for (const width of sheet.columnWidths) {
          xml += `
   <Column ss:Width="${width}"/>`;
        }
      }

      // Data rows
      for (let rowIdx = 0; rowIdx < sheet.data.length; rowIdx++) {
        const row = sheet.data[rowIdx];
        const isHeader = sheet.headerStyle && rowIdx === 0;
        
        xml += `
   <Row${isHeader ? ' ss:Height="25"' : ''}>`;
        
        for (const cell of row) {
          let cellType = 'String';
          let cellStyle = isHeader ? ' ss:StyleID="Header"' : '';
          let cellValue = escapeXML(cell);
          
          if (typeof cell === 'number') {
            cellType = 'Number';
            cellValue = String(cell);
          } else if (cell instanceof Date) {
            cellType = 'DateTime';
            cellValue = cell.toISOString();
            cellStyle = ' ss:StyleID="Date"';
          }
          
          xml += `
    <Cell${cellStyle}><Data ss:Type="${cellType}">${cellValue}</Data></Cell>`;
        }
        
        xml += `
   </Row>`;
      }

      xml += `
  </Table>
 </Worksheet>`;
    }

    xml += `
</Workbook>`;

    return xml;
  }

  /**
   * Télécharger un fichier Excel (format XML Spreadsheet 2003)
   */
  static download(workbookXML: string, filename: string): void {
    const blob = new Blob([workbookXML], { 
      type: 'application/vnd.ms-excel' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  /**
   * Export des membres en Excel
   */
  static exportMembers(members: MemberExportData[], options?: {
    title?: string;
    churchName?: string;
    generatedDate?: string;
  }): string {
    const data: any[][] = [];
    
    // Title rows
    if (options?.title) {
      data.push([options.title]);
      data.push([options.churchName || '']);
      data.push([`Généré le: ${options.generatedDate || new Date().toLocaleDateString('fr-FR')}`]);
      data.push([]); // Empty row
    }

    // Headers
    data.push([
      'N° Membre', 'Nom', 'Prénom', 'Email', 'Téléphone', 
      'Rôle', 'Statut', 'Date adhésion', 'Date naissance', 
      'Adresse', 'Ville', 'Pays'
    ]);

    // Data
    for (const m of members) {
      data.push([
        m.memberNumber, m.lastName, m.firstName, m.email, m.phone || '',
        m.role, m.status, m.joinDate, m.birthDate || '',
        m.address || '', m.city || '', m.country || ''
      ]);
    }

    // Summary
    data.push([]);
    data.push([`Total: ${members.length} membres`]);

    return this.createWorkbookXML([{
      name: 'Membres',
      data,
      columnWidths: [80, 100, 100, 180, 100, 80, 80, 100, 100, 150, 100, 100],
      headerStyle: true,
    }]);
  }

  /**
   * Export des dons en Excel
   */
  static exportDonations(donations: DonationExportData[], options?: {
    title?: string;
    period?: string;
    churchName?: string;
  }): string {
    const data: any[][] = [];
    
    // Title
    if (options?.title) {
      data.push([options.title]);
      data.push([options.churchName || '']);
      data.push([`Période: ${options.period || 'Toutes'}`]);
      data.push([]);
    }

    // Headers
    data.push([
      'Date', 'Référence', 'Donateur', 'N° Membre', 'Montant',
      'Devise', 'Type', 'Mode paiement', 'Projet', 'Anonyme'
    ]);

    // Data
    let totalAmount = 0;
    for (const d of donations) {
      data.push([
        d.date, d.reference, d.isAnonymous ? 'Anonyme' : d.memberName,
        d.memberNumber || '-', d.amount, d.currency, d.type,
        d.paymentMethod, d.project || '-', d.isAnonymous ? 'Oui' : 'Non'
      ]);
      totalAmount += d.amount;
    }

    // Summary
    data.push([]);
    data.push(['TOTAL', '', '', '', totalAmount, donations[0]?.currency || 'EUR']);

    return this.createWorkbookXML([{
      name: 'Dons',
      data,
      columnWidths: [90, 100, 150, 80, 100, 60, 100, 120, 100, 60],
      headerStyle: true,
    }]);
  }

  /**
   * Export rapport financier complet en Excel
   */
  static exportFinancialReport(report: FinancialReportData): string {
    const sheets: { name: string; data: any[][]; columnWidths?: number[]; headerStyle?: boolean }[] = [];

    // Sheet 1: Résumé
    const summaryData: any[][] = [
      ['RAPPORT FINANCIER'],
      [`Période: ${report.period}`],
      [`Du ${report.startDate} au ${report.endDate}`],
      [],
      ['RÉSUMÉ'],
      [],
      ['Total Revenus', report.totalIncome, report.currency],
      ['Total Dépenses', report.totalExpenses, report.currency],
      ['Solde Net', report.netBalance, report.currency],
      [],
      ['REVENUS PAR CATÉGORIE'],
      ['Catégorie', 'Montant', 'Pourcentage'],
    ];
    for (const cat of report.incomeByCategory) {
      summaryData.push([cat.category, cat.amount, `${cat.percentage}%`]);
    }
    summaryData.push([]);
    summaryData.push(['DÉPENSES PAR CATÉGORIE']);
    summaryData.push(['Catégorie', 'Montant', 'Pourcentage']);
    for (const cat of report.expensesByCategory) {
      summaryData.push([cat.category, cat.amount, `${cat.percentage}%`]);
    }

    sheets.push({
      name: 'Résumé',
      data: summaryData,
      columnWidths: [150, 120, 80],
      headerStyle: false,
    });

    // Sheet 2: Tendance mensuelle
    const trendData: any[][] = [
      ['TENDANCE MENSUELLE'],
      [],
      ['Mois', 'Revenus', 'Dépenses', 'Solde'],
    ];
    for (const m of report.monthlyTrend) {
      trendData.push([m.month, m.income, m.expenses, m.income - m.expenses]);
    }

    sheets.push({
      name: 'Tendance',
      data: trendData,
      columnWidths: [100, 100, 100, 100],
      headerStyle: true,
    });

    // Sheet 3: Détail des dons
    const donationsData: any[][] = [
      ['DÉTAIL DES DONS'],
      [],
      ['Date', 'Référence', 'Donateur', 'Montant', 'Type', 'Mode paiement'],
    ];
    for (const d of report.donations) {
      donationsData.push([
        d.date, d.reference, d.isAnonymous ? 'Anonyme' : d.memberName,
        d.amount, d.type, d.paymentMethod
      ]);
    }

    sheets.push({
      name: 'Dons',
      data: donationsData,
      columnWidths: [90, 100, 150, 100, 100, 120],
      headerStyle: true,
    });

    return this.createWorkbookXML(sheets);
  }

  /**
   * Export de présence en Excel
   */
  static exportAttendance(attendance: AttendanceExportData[]): string {
    const sheets: { name: string; data: any[][]; columnWidths?: number[]; headerStyle?: boolean }[] = [];

    // Sheet 1: Résumé par événement
    const summaryData: any[][] = [
      ['RAPPORT DE PRÉSENCE'],
      [],
      ['Date', 'Événement', 'Type', 'Participants', 'Nouveaux visiteurs'],
    ];
    let totalAttendees = 0;
    let totalVisitors = 0;
    for (const a of attendance) {
      summaryData.push([a.date, a.eventName, a.eventType, a.totalAttendees, a.newVisitors]);
      totalAttendees += a.totalAttendees;
      totalVisitors += a.newVisitors;
    }
    summaryData.push([]);
    summaryData.push(['TOTAUX', '', '', totalAttendees, totalVisitors]);

    sheets.push({
      name: 'Résumé',
      data: summaryData,
      columnWidths: [90, 150, 100, 100, 120],
      headerStyle: true,
    });

    // Sheet 2: Détail par membre (toutes dates confondues)
    const detailData: any[][] = [
      ['DÉTAIL DES PRÉSENCES'],
      [],
      ['Date', 'Événement', 'Nom', 'N° Membre', 'Heure arrivée', 'Méthode'],
    ];
    for (const a of attendance) {
      for (const m of a.members) {
        detailData.push([a.date, a.eventName, m.name, m.memberNumber, m.checkInTime, m.method]);
      }
    }

    sheets.push({
      name: 'Détail',
      data: detailData,
      columnWidths: [90, 150, 150, 80, 100, 100],
      headerStyle: true,
    });

    return this.createWorkbookXML(sheets);
  }
}

// ============================================================================
// PDF EXPORT SERVICE (HTML to PDF via Print ou API)
// ============================================================================

export class PDFExportService {
  /**
   * Générer un PDF via l'impression du navigateur
   */
  static printToPDF(htmlContent: string, options?: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
  }): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Impossible d\'ouvrir la fenêtre d\'impression');
      return;
    }

    const styles = `
      <style>
        @page {
          size: ${options?.orientation === 'landscape' ? 'landscape' : 'portrait'};
          margin: 1cm;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 24px;
        }
        .header .subtitle {
          color: #6b7280;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 10px;
          text-align: left;
        }
        th {
          background: #2563eb;
          color: white;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .total-row {
          font-weight: bold;
          background: #f3f4f6 !important;
        }
        .amount {
          text-align: right;
        }
        .highlight {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${options?.title || 'Document MyChurchApp'}</title>
        ${styles}
      </head>
      <body>
        ${htmlContent}
        <div class="footer">
          <p>Document généré par MyChurchApp le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p>© ${new Date().getFullYear()} MyChurchApp - Tous droits réservés</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  /**
   * Générer un reçu fiscal PDF
   */
  static generateTaxReceipt(data: TaxReceiptData): string {
    const donationsRows = data.donations.map(d => `
      <tr>
        <td>${d.date}</td>
        <td>${d.type}</td>
        <td class="amount">${d.amount.toLocaleString('fr-FR')} ${data.currency}</td>
      </tr>
    `).join('');

    return `
      <div class="header">
        <h1>${data.organizationName}</h1>
        <p class="subtitle">${data.organizationAddress}</p>
        <p class="subtitle">N° Fiscal: ${data.organizationTaxId}</p>
      </div>

      <div style="text-align:center;margin:30px 0">
        <h2 style="color:#059669">REÇU FISCAL N° ${data.receiptNumber}</h2>
        <p>Année fiscale: ${data.year}</p>
      </div>

      <div class="highlight">
        <h3 style="margin-top:0">Informations du donateur</h3>
        <p><strong>Nom:</strong> ${data.donorName}</p>
        <p><strong>Adresse:</strong> ${data.donorAddress}</p>
        <p><strong>Email:</strong> ${data.donorEmail}</p>
      </div>

      <h3>Détail des dons</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type de don</th>
            <th style="text-align:right">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${donationsRows}
          <tr class="total-row">
            <td colspan="2"><strong>TOTAL</strong></td>
            <td class="amount"><strong>${data.totalAmount.toLocaleString('fr-FR')} ${data.currency}</strong></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:40px;padding:20px;border:2px solid #2563eb;border-radius:8px">
        <p style="margin:0"><strong>Attestation:</strong></p>
        <p>Je soussigné(e), représentant légal de ${data.organizationName}, certifie que les dons mentionnés ci-dessus ont bien été reçus et correspondent à des versements effectués au profit de notre organisation.</p>
        <p>Ce reçu est établi pour servir et valoir ce que de droit, notamment pour permettre au donateur de bénéficier de la réduction d'impôt prévue par les dispositions légales en vigueur.</p>
        <p style="margin-bottom:0;text-align:right">
          <br>Fait le ${data.generatedDate}<br><br>
          <em>Signature et cachet de l'organisation</em>
        </p>
      </div>

      <p style="color:#6b7280;font-size:11px;margin-top:30px">
        <strong>Important:</strong> Ce document doit être conservé pendant une durée minimale de 3 ans. 
        Il peut être demandé par l'administration fiscale en cas de contrôle.
      </p>
    `;
  }

  /**
   * Générer un rapport financier PDF
   */
  static generateFinancialReportPDF(report: FinancialReportData, churchName: string): string {
    const incomeCategoryRows = report.incomeByCategory.map(c => `
      <tr>
        <td>${c.category}</td>
        <td class="amount">${c.amount.toLocaleString('fr-FR')} ${report.currency}</td>
        <td style="text-align:center">${c.percentage}%</td>
      </tr>
    `).join('');

    const expenseCategoryRows = report.expensesByCategory.map(c => `
      <tr>
        <td>${c.category}</td>
        <td class="amount">${c.amount.toLocaleString('fr-FR')} ${report.currency}</td>
        <td style="text-align:center">${c.percentage}%</td>
      </tr>
    `).join('');

    const monthlyRows = report.monthlyTrend.map(m => `
      <tr>
        <td>${m.month}</td>
        <td class="amount">${m.income.toLocaleString('fr-FR')}</td>
        <td class="amount">${m.expenses.toLocaleString('fr-FR')}</td>
        <td class="amount" style="color:${m.income - m.expenses >= 0 ? '#059669' : '#dc2626'}">
          ${(m.income - m.expenses).toLocaleString('fr-FR')}
        </td>
      </tr>
    `).join('');

    return `
      <div class="header">
        <h1>${churchName}</h1>
        <p class="subtitle">Rapport Financier</p>
        <p class="subtitle">Période: ${report.period}</p>
        <p class="subtitle">Du ${report.startDate} au ${report.endDate}</p>
      </div>

      <h2>📊 Résumé Financier</h2>
      <div style="display:flex;gap:20px;margin:20px 0">
        <div style="flex:1;padding:20px;background:#f0fdf4;border-radius:8px;text-align:center">
          <p style="margin:0;color:#6b7280">Total Revenus</p>
          <p style="margin:5px 0;font-size:24px;font-weight:bold;color:#059669">
            ${report.totalIncome.toLocaleString('fr-FR')} ${report.currency}
          </p>
        </div>
        <div style="flex:1;padding:20px;background:#fef2f2;border-radius:8px;text-align:center">
          <p style="margin:0;color:#6b7280">Total Dépenses</p>
          <p style="margin:5px 0;font-size:24px;font-weight:bold;color:#dc2626">
            ${report.totalExpenses.toLocaleString('fr-FR')} ${report.currency}
          </p>
        </div>
        <div style="flex:1;padding:20px;background:${report.netBalance >= 0 ? '#f0fdf4' : '#fef2f2'};border-radius:8px;text-align:center">
          <p style="margin:0;color:#6b7280">Solde Net</p>
          <p style="margin:5px 0;font-size:24px;font-weight:bold;color:${report.netBalance >= 0 ? '#059669' : '#dc2626'}">
            ${report.netBalance.toLocaleString('fr-FR')} ${report.currency}
          </p>
        </div>
      </div>

      <h3>📈 Revenus par catégorie</h3>
      <table>
        <thead>
          <tr>
            <th>Catégorie</th>
            <th style="text-align:right">Montant</th>
            <th style="text-align:center">%</th>
          </tr>
        </thead>
        <tbody>
          ${incomeCategoryRows}
        </tbody>
      </table>

      <h3>📉 Dépenses par catégorie</h3>
      <table>
        <thead>
          <tr>
            <th>Catégorie</th>
            <th style="text-align:right">Montant</th>
            <th style="text-align:center">%</th>
          </tr>
        </thead>
        <tbody>
          ${expenseCategoryRows}
        </tbody>
      </table>

      <h3>📅 Tendance mensuelle</h3>
      <table>
        <thead>
          <tr>
            <th>Mois</th>
            <th style="text-align:right">Revenus</th>
            <th style="text-align:right">Dépenses</th>
            <th style="text-align:right">Solde</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyRows}
        </tbody>
      </table>
    `;
  }

  /**
   * Générer un rapport de présence PDF
   */
  static generateAttendanceReportPDF(
    attendance: AttendanceExportData[],
    options: { churchName: string; period: string }
  ): string {
    const summaryRows = attendance.map(a => `
      <tr>
        <td>${a.date}</td>
        <td>${a.eventName}</td>
        <td>${a.eventType}</td>
        <td style="text-align:center">${a.totalAttendees}</td>
        <td style="text-align:center">${a.newVisitors}</td>
      </tr>
    `).join('');

    const totalAttendees = attendance.reduce((sum, a) => sum + a.totalAttendees, 0);
    const totalVisitors = attendance.reduce((sum, a) => sum + a.newVisitors, 0);
    const avgAttendance = Math.round(totalAttendees / attendance.length);

    return `
      <div class="header">
        <h1>${options.churchName}</h1>
        <p class="subtitle">Rapport de Présence</p>
        <p class="subtitle">Période: ${options.period}</p>
      </div>

      <h2>📊 Statistiques globales</h2>
      <div style="display:flex;gap:20px;margin:20px 0">
        <div style="flex:1;padding:20px;background:#eff6ff;border-radius:8px;text-align:center">
          <p style="margin:0;color:#6b7280">Total présences</p>
          <p style="margin:5px 0;font-size:24px;font-weight:bold;color:#2563eb">${totalAttendees}</p>
        </div>
        <div style="flex:1;padding:20px;background:#f0fdf4;border-radius:8px;text-align:center">
          <p style="margin:0;color:#6b7280">Nouveaux visiteurs</p>
          <p style="margin:5px 0;font-size:24px;font-weight:bold;color:#059669">${totalVisitors}</p>
        </div>
        <div style="flex:1;padding:20px;background:#fef3c7;border-radius:8px;text-align:center">
          <p style="margin:0;color:#6b7280">Moyenne/événement</p>
          <p style="margin:5px 0;font-size:24px;font-weight:bold;color:#d97706">${avgAttendance}</p>
        </div>
      </div>

      <h3>📅 Détail par événement</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Événement</th>
            <th>Type</th>
            <th style="text-align:center">Participants</th>
            <th style="text-align:center">Visiteurs</th>
          </tr>
        </thead>
        <tbody>
          ${summaryRows}
          <tr class="total-row">
            <td colspan="3"><strong>TOTAUX</strong></td>
            <td style="text-align:center"><strong>${totalAttendees}</strong></td>
            <td style="text-align:center"><strong>${totalVisitors}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  /**
   * Générer la liste des membres PDF
   */
  static generateMembersListPDF(
    members: MemberExportData[],
    options: { churchName: string; title?: string }
  ): string {
    const memberRows = members.map((m, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${m.memberNumber}</td>
        <td><strong>${m.lastName}</strong> ${m.firstName}</td>
        <td>${m.email}</td>
        <td>${m.phone || '-'}</td>
        <td>${m.role}</td>
        <td><span style="padding:2px 8px;border-radius:4px;font-size:11px;background:${m.status === 'actif' ? '#d1fae5' : '#fee2e2'};color:${m.status === 'actif' ? '#065f46' : '#991b1b'}">${m.status}</span></td>
      </tr>
    `).join('');

    const roleStats = members.reduce((acc: Record<string, number>, m) => {
      acc[m.role] = (acc[m.role] || 0) + 1;
      return acc;
    }, {});

    const statsHTML = Object.entries(roleStats)
      .map(([role, count]) => `<span style="margin-right:20px">${role}: <strong>${count}</strong></span>`)
      .join('');

    return `
      <div class="header">
        <h1>${options.churchName}</h1>
        <p class="subtitle">${options.title || 'Liste des Membres'}</p>
        <p class="subtitle">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div class="highlight">
        <strong>Statistiques:</strong> Total: ${members.length} membres | ${statsHTML}
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>N° Membre</th>
            <th>Nom complet</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${memberRows}
        </tbody>
      </table>
    `;
  }
}

// ============================================================================
// EXPORT MANAGER (Gestionnaire principal)
// ============================================================================

export class ExportManager {
  private static instance: ExportManager;

  private constructor() {}

  static getInstance(): ExportManager {
    if (!ExportManager.instance) {
      ExportManager.instance = new ExportManager();
    }
    return ExportManager.instance;
  }

  /**
   * Export des membres
   */
  exportMembers(
    members: MemberExportData[],
    format: 'excel' | 'pdf' | 'csv',
    options?: { churchName?: string; title?: string }
  ): void {
    const filename = `membres_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'csv':
        const csv = CSVExportService.exportMembers(members);
        CSVExportService.download(csv, filename);
        break;
      case 'excel':
        const excel = ExcelExportService.exportMembers(members, {
          title: options?.title || 'Liste des Membres',
          churchName: options?.churchName,
          generatedDate: new Date().toLocaleDateString('fr-FR'),
        });
        ExcelExportService.download(excel, filename);
        break;
      case 'pdf':
        const html = PDFExportService.generateMembersListPDF(members, {
          churchName: options?.churchName || 'MyChurchApp',
          title: options?.title,
        });
        PDFExportService.printToPDF(html, { title: 'Liste des Membres' });
        break;
    }
  }

  /**
   * Export des dons
   */
  exportDonations(
    donations: DonationExportData[],
    format: 'excel' | 'pdf' | 'csv',
    options?: { churchName?: string; period?: string }
  ): void {
    const filename = `dons_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'csv':
        const csv = CSVExportService.exportDonations(donations);
        CSVExportService.download(csv, filename);
        break;
      case 'excel':
        const excel = ExcelExportService.exportDonations(donations, {
          title: 'Rapport des Dons',
          churchName: options?.churchName,
          period: options?.period,
        });
        ExcelExportService.download(excel, filename);
        break;
      case 'pdf':
        // Pour PDF, on génère un rapport financier simplifié
        PDFExportService.printToPDF(`
          <div class="header">
            <h1>${options?.churchName || 'MyChurchApp'}</h1>
            <p class="subtitle">Rapport des Dons</p>
            <p class="subtitle">Période: ${options?.period || 'Toutes'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Référence</th>
                <th>Donateur</th>
                <th>Type</th>
                <th style="text-align:right">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${donations.map(d => `
                <tr>
                  <td>${d.date}</td>
                  <td>${d.reference}</td>
                  <td>${d.isAnonymous ? 'Anonyme' : d.memberName}</td>
                  <td>${d.type}</td>
                  <td class="amount">${d.amount.toLocaleString('fr-FR')} ${d.currency}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL</strong></td>
                <td class="amount"><strong>${donations.reduce((s, d) => s + d.amount, 0).toLocaleString('fr-FR')} ${donations[0]?.currency || 'EUR'}</strong></td>
              </tr>
            </tbody>
          </table>
        `, { title: 'Rapport des Dons' });
        break;
    }
  }

  /**
   * Export rapport financier
   */
  exportFinancialReport(report: FinancialReportData, format: 'excel' | 'pdf', churchName: string): void {
    const filename = `rapport_financier_${report.period.replace(/\s/g, '_')}`;
    
    switch (format) {
      case 'excel':
        const excel = ExcelExportService.exportFinancialReport(report);
        ExcelExportService.download(excel, filename);
        break;
      case 'pdf':
        const html = PDFExportService.generateFinancialReportPDF(report, churchName);
        PDFExportService.printToPDF(html, { title: 'Rapport Financier', orientation: 'portrait' });
        break;
    }
  }

  /**
   * Export rapport de présence
   */
  exportAttendanceReport(
    attendance: AttendanceExportData[],
    format: 'excel' | 'pdf',
    options: { churchName: string; period: string }
  ): void {
    const filename = `presences_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'excel':
        const excel = ExcelExportService.exportAttendance(attendance);
        ExcelExportService.download(excel, filename);
        break;
      case 'pdf':
        const html = PDFExportService.generateAttendanceReportPDF(attendance, options);
        PDFExportService.printToPDF(html, { title: 'Rapport de Présence' });
        break;
    }
  }

  /**
   * Générer un reçu fiscal
   */
  generateTaxReceipt(data: TaxReceiptData): void {
    const html = PDFExportService.generateTaxReceipt(data);
    PDFExportService.printToPDF(html, { title: `Reçu Fiscal ${data.receiptNumber}` });
  }
}

// Export singleton
export const exportManager = ExportManager.getInstance();
