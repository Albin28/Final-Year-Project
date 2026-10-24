import React from 'react';
import { Printer, X } from 'lucide-react';

const ThermalReceiptModal = ({ bill, onClose }) => {
  if (!bill) return null;

  const total = Number(bill.total_amount) || 0;
  // Compute standard 5% GST breakdown (CGST 2.5% + SGST 2.5%)
  const subtotal = total / 1.05;
  const totalGst = total - subtotal;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  const billDate = bill.created_at ? new Date(bill.created_at) : new Date();
  const formattedDate = billDate.toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const formattedTime = billDate.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const totalItemsCount = (bill.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
    }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt-printable, #thermal-receipt-printable * {
            visibility: visible;
          }
          #thermal-receipt-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 76mm !important;
            margin: 0 !important;
            padding: 2mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={{
        backgroundColor: 'white', borderRadius: '12px', width: '380px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div className="no-print" style={{
          padding: '0.8rem 1.2rem', backgroundColor: '#714B67', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '14px' }}>
            <Printer size={16} /> 80mm POS Thermal Receipt
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Receipt Container */}
        <div style={{ padding: '1.2rem', overflowY: 'auto', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center' }}>
          <div id="thermal-receipt-printable" style={{
            width: '280px', backgroundColor: 'white', padding: '14px',
            fontFamily: "'Courier New', Courier, monospace", fontSize: '11px',
            color: '#111827', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #E5E7EB', lineHeight: '1.3'
          }}>
            {/* Store Header */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '0.5px' }}>NEXUSERP STORE</div>
              <div style={{ fontSize: '10px', color: '#4B5563' }}>SMART RETAIL & GROCERY</div>
              <div style={{ fontSize: '9px', color: '#6B7280' }}>GSTIN: 29ABCDE1234F1Z5</div>
              <div style={{ fontSize: '9px', color: '#6B7280' }}>42 Commercial Avenue, Metro</div>
              <div style={{ fontSize: '9px', color: '#6B7280' }}>Ph: +91 98765 43210</div>
            </div>

            <div style={{ borderBottom: '1px dashed #6B7280', margin: '6px 0' }} />

            {/* Bill Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>INV #{String(bill.id).padStart(5, '0')}</span>
              <span>{formattedDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span>Cashier: Counter-1</span>
              <span>{formattedTime}</span>
            </div>

            <div style={{ borderBottom: '1px dashed #6B7280', margin: '6px 0' }} />

            {/* Item Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 2fr 2fr', fontWeight: '700', fontSize: '10px', marginBottom: '4px' }}>
              <span>Item</span>
              <span style={{ textAlign: 'center' }}>Qty</span>
              <span style={{ textAlign: 'right' }}>Rate</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>
            <div style={{ borderBottom: '1px solid #D1D5DB', marginBottom: '4px' }} />

            {/* Item Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {(bill.items || []).map((it, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 2fr 2fr', fontSize: '10px' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={it.product_name}>
                    {it.product_name}
                  </span>
                  <span style={{ textAlign: 'center' }}>{it.quantity}</span>
                  <span style={{ textAlign: 'right' }}>{Number(it.unit_price).toFixed(2)}</span>
                  <span style={{ textAlign: 'right', fontWeight: '600' }}>{Number(it.line_total).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderBottom: '1px dashed #6B7280', margin: '6px 0' }} />

            {/* Tax Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Taxable Subtotal:</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563', fontSize: '9px' }}>
                <span>CGST (2.5%):</span>
                <span>Rs. {cgst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563', fontSize: '9px' }}>
                <span>SGST (2.5%):</span>
                <span>Rs. {sgst.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #111827', margin: '6px 0' }} />

            {/* Net Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '900' }}>
              <span>NET TOTAL:</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#6B7280', marginTop: '2px' }}>
              <span>Total Units: {totalItemsCount}</span>
              <span>Mode: CASH / UPI</span>
            </div>

            <div style={{ borderBottom: '1px dashed #6B7280', margin: '8px 0' }} />

            {/* Barcode Mock */}
            <div style={{ textAlign: 'center', margin: '6px 0' }}>
              <div style={{ letterSpacing: '3px', fontSize: '14px', fontWeight: 'bold' }}>
                ||| | ||||| || |||| |||
              </div>
              <div style={{ fontSize: '8px', color: '#6B7280', marginTop: '2px' }}>
                *NX-{String(bill.id).padStart(6, '0')}*
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '9px', color: '#6B7280', marginTop: '6px' }}>
              <div>Thank you for shopping with us!</div>
              <div>Exchange valid within 7 days with bill.</div>
              <div style={{ marginTop: '3px', fontWeight: '600' }}>*** Powered by NexusERP ***</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="no-print" style={{
          padding: '0.8rem 1.2rem', backgroundColor: 'white', borderTop: '1px solid #E5E7EB',
          display: 'flex', justifyContent: 'space-between', gap: '0.5rem'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.5rem', backgroundColor: '#F3F4F6', color: '#374151',
              border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px',
              fontWeight: '600', cursor: 'pointer'
            }}
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            style={{
              flex: 2, padding: '0.5rem', backgroundColor: '#714B67', color: 'white',
              border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}
          >
            <Printer size={15} /> Print Thermal Slip (Ctrl+P)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThermalReceiptModal;
