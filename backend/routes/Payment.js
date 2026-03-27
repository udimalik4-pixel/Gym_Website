// ====== CHECKOUT & PAYMENT ======

function openCheckout(planName, planPrice) {
  document.getElementById('checkoutPlanName').value = planName;
  document.getElementById('checkoutPlanPrice').value = planPrice;
  document.getElementById('checkoutPlanSummary').innerHTML = `
    <div style="padding:16px 28px;border-bottom:1px solid var(--border);background:var(--card);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:2px;color:var(--accent)">SELECTED PLAN</div>
        <div style="font-family:var(--font-display);font-size:24px;letter-spacing:1px;margin-top:4px">${planName.toUpperCase()}</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--font-display);font-size:32px;color:var(--accent)">&#x20B9;${Number(planPrice).toLocaleString('en-IN')}</div>
        <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:1px;color:var(--text-dim)">PER MONTH</div>
      </div>
    </div>
  `;
  // Clear form
  document.getElementById('checkoutName').value = '';
  document.getElementById('checkoutEmail').value = '';
  document.getElementById('checkoutPhone').value = '';
  openModal('checkoutModal');
}

async function initiatePayment(e) {
  e.preventDefault();
  const payBtn = document.getElementById('payBtn');
  payBtn.textContent = 'PROCESSING...';
  payBtn.disabled = true;

  const planName = document.getElementById('checkoutPlanName').value;
  const planPrice = Number(document.getElementById('checkoutPlanPrice').value);
  const memberName = document.getElementById('checkoutName').value;
  const memberEmail = document.getElementById('checkoutEmail').value;
  const memberPhone = document.getElementById('checkoutPhone').value;

  try {
    // Create order on backend
    const orderData = await api.post('/payment/create-order', {
      amount: planPrice,
      planName,
      memberName,
      memberEmail,
      memberPhone
    });

    // Open Razorpay checkout
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'IronPeak Fitness',
      description: `${planName} Membership`,
      order_id: orderData.orderId,
      prefill: {
        name: memberName,
        email: memberEmail,
        contact: memberPhone
      },
      theme: { color: '#e8c547' },
      modal: {
        ondismiss: () => {
          payBtn.textContent = 'PAY NOW';
          payBtn.disabled = false;
          showToast('Payment cancelled', 'error');
        }
      },
      handler: async function (response) {
        // Verify payment on backend
        try {
          const result = await api.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            memberId: orderData.memberId
          });

          closeModal('checkoutModal');
          showSuccessModal(memberEmail, planName, planPrice, response.razorpay_payment_id);
        } catch (err) {
          showToast('Payment verification failed: ' + err.message, 'error');
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

    payBtn.textContent = 'PAY NOW';
    payBtn.disabled = false;

  } catch (err) {
    showToast(err.message, 'error');
    payBtn.textContent = 'PAY NOW';
    payBtn.disabled = false;
  }
}

function showSuccessModal(email, planName, planPrice, paymentId) {
  document.getElementById('successEmail').textContent = email;
  document.getElementById('successDetails').innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:6px;padding:20px 24px;text-align:left">
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--text-dim);font-size:13px">Plan</span>
        <span style="font-family:var(--font-display);letter-spacing:1px;color:var(--accent)">${planName.toUpperCase()}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--text-dim);font-size:13px">Amount Paid</span>
        <span style="color:var(--text);font-size:13px">&#x20B9;${Number(planPrice).toLocaleString('en-IN')}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0">
        <span style="color:var(--text-dim);font-size:13px">Payment ID</span>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim)">${paymentId}</span>
      </div>
    </div>
  `;
  openModal('successModal');
}

// ====== MEMBERS ADMIN ======

async function openMembersModal() {
  openModal('membersModal');
  const tbody = document.getElementById('membersBody');
  tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Loading members...</td></tr>';
  try {
    const members = await api.get('/payment/members');
    if (!members.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No paid members yet</td></tr>';
      return;
    }
    tbody.innerHTML = members.map(m => `
      <tr>
        <td style="font-weight:500">${m.name}</td>
        <td style="color:var(--text-dim);font-size:13px">${m.email}</td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim)">${m.phone}</td>
        <td><span style="font-family:var(--font-display);letter-spacing:1px;color:var(--accent)">${m.plan}</span></td>
        <td style="font-family:var(--font-mono);font-size:12px;color:var(--accent)">&#x20B9;${m.planPrice?.toLocaleString('en-IN')}</td>
        <td style="font-size:12px;color:var(--text-dim)">${m.endDate ? new Date(m.endDate).toLocaleDateString('en-IN') : '—'}</td>
        <td><button class="btn-danger" onclick="deleteMember('${m._id}')">Remove</button></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-cell" style="color:var(--accent-red)">${err.message}</td></tr>`;
  }
}

async function deleteMember(id) {
  if (!confirm('Remove this member?')) return;
  try {
    await api.delete(`/payment/members/${id}`);
    showToast('Member removed');
    openMembersModal();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
