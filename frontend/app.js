document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('editDate').addEventListener('change', loadEditTimeSlots);
  // Έλεγχος σύνδεσης χρήστη
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return window.location.href = '/login.html';

    const user = await res.json();

    const greeting = document.getElementById('greeting');
    const nameDisplay = document.getElementById('userDisplayName');
    const welcome = document.getElementById('welcomeUser');
    const dropdownUser = document.getElementById('dropdownUsername');

    if (greeting) greeting.textContent = `Καλωσήρθες, ${user.name}!`;
    if (nameDisplay) nameDisplay.textContent = user.name;
    if (welcome) welcome.textContent = `Καλωσήρθες, ${user.name}!`;
    if (dropdownUser) dropdownUser.textContent = user.name;
  } catch (err) {
    console.error('Έλεγχος σύνδεσης αποτυχημένος:', err);
    return window.location.href = '/login.html';
  }

  const apiUrl = '/api/facilities';

  const facilitiesDiv = document.getElementById('facilities');
  const reservationModal = new bootstrap.Modal(document.getElementById('reservationModal'));
  const reservationForm = document.getElementById('reservationForm');
  const facilityIdInput = document.getElementById('facilityId');
  const reservationsDiv = document.getElementById('reservations');
  const viewReservationsBtn = document.getElementById('viewReservationsBtn');
  const dateFilter = document.getElementById('filterDate');
  const editModal = new bootstrap.Modal(document.getElementById('editReservationModal'));
  const editForm = document.getElementById('editReservationForm');

  let allReservations = [];

  // Φόρτωση εγκαταστάσεων
  async function loadFacilities() {
    try {
      const res = await fetch(apiUrl);
      const facilities = await res.json();

      facilitiesDiv.innerHTML = '';
      facilities.forEach(facility => {
        const div = document.createElement('div');
        div.className = 'col-md-4';
        div.innerHTML = `
          <div class="card h-100 shadow">
            <img src="${facility.photoUrl}" class="card-img-top" alt="${facility.name}" style="object-fit: cover; height: 250px;">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title">${facility.name}</h5>
                <p class="card-text">${facility.description}</p>
              </div>
              <button class="btn btn-success mt-3" onclick="openReservation('${facility._id}')">Κάνε Κράτηση</button>
            </div>
          </div>
        `;
        facilitiesDiv.appendChild(div);
      });
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  }

  // Άνοιγμα modal κράτησης
  window.openReservation = async (id) => {
    facilityIdInput.value = id;
    reservationModal.show();

    const username = localStorage.getItem('userName');
    const dateInput = document.getElementById('date');
    const editDate = document.getElementById("editDate");
    const timeSlotSelect = document.getElementById('timeSlot');
    const userField = document.getElementById("userName");

    if (!username) {
      alert("Πρέπει να συνδεθείτε πρώτα.");
      window.location.href = "/login.html";
      return;
    }

    //Autofill username 
    userField.value = username;
    userField.readOnly = true;

    //Prevent past Dates 
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;

    dateInput.value = '';
    timeSlotSelect.innerHTML = '<option value="">Επέλεξε ώρα</option>';

    // ➤ Φόρτωσε time slots για τη σημερινή ημερομηνία προαιρετικά (αν θέλεις)
    dateInput.addEventListener('change', async () => {
      const date = dateInput.value;
      if (!date) return;

      const takenSlots = await checkAvailability(id, date);
      const allSlots = ['10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00'];

      timeSlotSelect.innerHTML = '<option value="">Επέλεξε ώρα</option>';

      allSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;

        if (!takenSlots.includes(slot)) {
          timeSlotSelect.appendChild(option);
        }
      });

      if (takenSlots.length === allSlots.length) {
        const opt = document.createElement('option');
        opt.textContent = 'Δεν υπάρχουν διαθέσιμες ώρες';
        opt.disabled = true;
        timeSlotSelect.appendChild(opt);
      }
    });
  };

  function renderReservationSection() {
    reservationsDiv.innerHTML = `
      <h2 class="text-center mb-4">Κρατήσεις</h2>
      <div class="mb-3">
        <input type="text" id="filterReservations" placeholder="Αναζήτηση κατά Όνομα Χρήστη, Εγκατάσταση ή Ημερομηνία..." class="form-control" />
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>Όνομα Χρήστη</th>
              <th>Εγκατάσταση</th>
              <th>Ημερομηνία</th>
              <th>Ώρα</th>
              <th>Ενέργειες</th>
            </tr>
          </thead>
          <tbody id="reservationsTableBody"></tbody>
        </table>
      </div>
    `;

    const filterField = document.getElementById('filterReservations');
    filterField.addEventListener('input', () => {
      const value = filterField.value.toLowerCase();
      const filtered = allReservations.filter(r =>
        r.user.toLowerCase().includes(value) ||
        r.facility.name.toLowerCase().includes(value) ||
        new Date(r.date).toLocaleDateString().includes(value)
      );
      displayReservations(filtered);
    });
  }

  function displayReservations(reservations) {
    const tbody = document.getElementById('reservationsTableBody');
    if (!tbody) return;

    tbody.innerHTML = reservations.map(r => `
      <tr>
        <td>${r.user}</td>
        <td>${r.facility.name}</td>
        <td>${new Date(r.date).toLocaleDateString()}</td>
        <td>${r.timeSlot}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="openEditModal('${r._id}')">Επεξεργασία</button>
          <button class="btn btn-sm btn-danger" onclick="deleteReservation('${r._id}')">Διαγραφή</button>
        </td>
      </tr>
    `).join('');
  }

  async function checkAvailability(facilityId, date) {
    try {
      const res = await fetch('/api/reservations/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId, date })
      });
      const data = await res.json();
      return data.takenSlots || [];
    } catch (err) {
      console.error('Availability error:', err);
      return [];
    }
  }

  reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userName = document.getElementById('userName').value;
    const date = document.getElementById('date').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const facilityId = facilityIdInput.value;

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility: facilityId, userName, date, timeSlot }),
      });

      if (res.ok) {
        alert('Κράτηση επιτυχής!');
        reservationForm.reset();
        reservationModal.hide();
        loadFacilities();
      } else {
        const err = await res.json();
        alert('Σφάλμα: ' + err.message);
      }
    } catch (err) {
      console.error(err);
      alert('Σφάλμα κατά την κράτηση.');
    }
  });

  async function loadEditTimeSlots() {
    const date = document.getElementById('editDate').value;
    const reservationId = document.getElementById('editReservationId').value;
    const timeSlotSelect = document.getElementById('editTimeSlot');

    const reservation = allReservations.find(r => r._id === reservationId);
    if (!reservation || !date) return;

    const facilityId = reservation.facility._id;

    const takenSlots = await checkAvailability(facilityId, date);
    const allSlots = ['10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00'];

    timeSlotSelect.innerHTML = '<option value="">Επέλεξε ώρα</option>';

    allSlots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot;
      option.textContent = slot;

      // Η ώρα είναι ήδη κρατημένη από άλλον → απενεργοποίηση
      if (takenSlots.includes(slot) && slot !== reservation.timeSlot) {
        option.disabled = true;
      }

      // Προεπιλογή ώρας (αν είναι η υπάρχουσα)
      if (slot === reservation.timeSlot) {
        option.selected = true;
      }

      timeSlotSelect.appendChild(option);
    });
  }

  window.openEditModal = async (id) => {
    const reservation = allReservations.find(r => r._id === id);
    if (!reservation) return;

    const editReservationId = document.getElementById('editReservationId');
    const editDate = document.getElementById('editDate');
    const editTimeSlot = document.getElementById('editTimeSlot');

    editReservationId.value = reservation._id;

    // ⛔ Prevent past dates
    const today = new Date().toISOString().split('T')[0];
    editDate.min = today;

    const reservationDate = new Date(reservation.date).toISOString().split('T')[0];

    // If reservation date is in the past, force today
    editDate.value = reservationDate >= today ? reservationDate : today;

    // Load availability
    const takenSlots = await checkAvailability(
      reservation.facility._id,
      editDate.value
    );

    const allSlots = [
      '10:00 - 12:00',
      '12:00 - 14:00',
      '14:00 - 16:00',
      '16:00 - 18:00',
      '18:00 - 20:00'
    ];

    editTimeSlot.innerHTML = '<option value="">Επέλεξε ώρα</option>';

    allSlots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot;
      option.textContent = slot;

      if (takenSlots.includes(slot) && slot !== reservation.timeSlot) {
        option.disabled = true;
      }

      if (slot === reservation.timeSlot) {
        option.selected = true;
      }

      editTimeSlot.appendChild(option);
    });

    editModal.show();
  };

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editReservationId').value;
    const date = document.getElementById('editDate').value;
    const timeSlot = document.getElementById('editTimeSlot').value;
    const today = new Date().toISOString().split("T")[0];

    if (date < today) {
      e.preventDefault();
      alert('Δεν επιτρέπεται ημερομηνία στο παρελθόν.');
      return;
    } 

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, timeSlot }),
      });

      if (res.ok) {
        alert('Η κράτηση ενημερώθηκε.');
        editModal.hide();
        viewReservationsBtn.click();
      } else {
        const err = await res.json();
        alert('Σφάλμα: ' + err.message);
      }
    } catch (err) {
      console.error('Edit reservation error:', err);
      alert('Σφάλμα κατά την επεξεργασία.');
    }
  });

  window.deleteReservation = async (id) => {
    if (!confirm('Είσαι σίγουρος;')) return;
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' }
});
      if (res.ok) {
        alert('Η κράτηση διαγράφηκε.');
        displayReservations(allReservations.filter(r => r._id !== id));
      } else {
        const err = await res.json();
        alert('Σφάλμα: ' + err.message);
      }
    } catch (err) {
      console.error('Error deleting reservation:', err);
      alert('Σφάλμα διαγραφής.');
    }
  };

  // Dropdown μενού λογαριασμού
  document.getElementById('accountMenu')?.addEventListener('click', (e) => {
    e.preventDefault();
    const dropdown = document.getElementById('accountDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountDropdown');
    const toggle = document.getElementById('accountMenu');
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await fetch('/api/logout');
    window.location.href = '/login.html';
  });

  document.getElementById('dashboardLink')?.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/my-reservations', { credentials: 'include' });
      const myReservations = await res.json();

      renderReservationSection();
      displayReservations(myReservations);
    } catch (err) {
      console.error('Dashboard error:', err);
      reservationsDiv.innerHTML = '<p class="text-danger">Αποτυχία φόρτωσης κρατήσεων.</p>';
    }
  });

  document.getElementById('reservationsLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('viewReservationsBtn')?.click();
  });

  document.getElementById('accountLink')?.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      const backOfficeLink = document.getElementById('back_office');
      const user = await res.json();
      const details = `
        <p><strong>Όνομα:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Ρόλος:</strong> ${user.role}</p>
      `;

      if (user.role !== 'admin' && backOfficeLink) {
        backOfficeLink.style.display = 'none';
      }

      document.getElementById('accountDetails').innerHTML = details;
      new bootstrap.Modal(document.getElementById('accountModal')).show();
      } catch (err) {
        console.error('Λάθος φόρτωσης προφίλ:', err);
        document.getElementById('accountDetails').innerHTML = 'Αποτυχία φόρτωσης στοιχείων.';
      }
  });

  // Αφαίρεση του κουμπιού "Δες Κρατήσεις"
  const viewBtn = document.getElementById('viewReservationsBtn');
  if (viewBtn) viewBtn.remove();

  // Το κουμπί Κρατήσεις να κάνει κατευθείαν fetch κρατήσεων
  document.getElementById('reservationsLink')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reservations');
      const reservations = await res.json();
      allReservations = reservations;
      renderReservationSection();
      displayReservations(reservations);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      reservationsDiv.innerHTML = `<p class="text-danger">Σφάλμα κατά τη φόρτωση κρατήσεων.</p>`;
    }
  });

  loadFacilities();
});

function logout() {
  fetch('/api/logout', {
    credentials: 'include'
  })
    .then(() => {
      localStorage.removeItem('userName');
      window.location.href = '/login.html';
    })
    .catch(err => {
      console.error('Logout error:', err);
    });
}