const scriptURL = 'https://script.google.com/macros/s/AKfycbxvPzkxHLyKCucR1F62_xEGl3_DBb03BFkQ2WS9wgR4TmBcB_xQAhlXgA68WPJGXe7Ftg/exec';

let books = []; 
let editingIndex = -1;
const itemsPerPage = 10; 
let currentPage = 1;

function getStatusColor(status) {
  if (status === 'Tersedia') {
    return 'available'; 
  } else if (status === 'Dipinjam') {
    return 'borrowed'; 
  }
  return ''; 
}

async function fetchBooks() {
  const response = await fetch(scriptURL);
  const data = await response.json();
  books = data; 
  displayBooks();
}

document.getElementById('bookForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const category = document.getElementById('category').value;
  const status = document.getElementById('status').value;

  const data = { action: 'add', book: { title, author, category, status } };

  await fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  books.push({ title, author, category, status });
  displayBooks();
  Swal.fire('Berhasil!', 'Buku telah ditambahkan.', 'success');
  document.getElementById('bookForm').reset();
  
  const modal = bootstrap.Modal.getInstance(document.getElementById('bookModal'));
  modal.hide();
});

function displayBooks() {
  const bookList = document.getElementById('bookList');
  bookList.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedBooks = books.slice(start, end);

  paginatedBooks.forEach((book, index) => {
    const row = document.createElement('tr');
    const statusClass = getStatusColor(book.status);

    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.category}</td>
      <td><span class="badge ${statusClass}">${book.status}</span></td>
      <td>
      <button class="btn btn-warning" onclick="editBook(${start + index})">
      <i class="fa fa-edit" aria-hidden="true"></i> Ubah</button>
      <button class="btn btn-danger" onclick="deleteBook(${start + index})">
      <i class="fa fa-trash" aria-hidden="true"></i> Hapus</button>

      </td>
    `;
    bookList.appendChild(row);
  });

  displayPagination();
}

function displayPagination() {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = '';

  const totalPages = Math.ceil(books.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.className = 'btn btn-primary m-1';
    button.innerText = i;

    if (i === currentPage) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      currentPage = i;
      displayBooks();
    });

    paginationElement.appendChild(button);
  }
}

function editBook(index) {
  const book = books[index];
  document.getElementById('editTitle').value = book.title;
  document.getElementById('editAuthor').value = book.author;
  document.getElementById('editCategory').value = book.category;
  document.getElementById('editStatus').value = book.status;

  editingIndex = index;
  const modal = new bootstrap.Modal(document.getElementById('editBookModal'));
  modal.show();
}

document.getElementById('editBookButton').addEventListener('click', async function(e) {
  e.preventDefault();

  const updatedTitle = document.getElementById('editTitle').value.trim();
  const updatedAuthor = document.getElementById('editAuthor').value.trim();
  const updatedCategory = document.getElementById('editCategory').value.trim();
  const updatedStatus = document.getElementById('editStatus').value.trim();

  if (!updatedTitle || !updatedAuthor || !updatedCategory || !updatedStatus) {
    Swal.fire('Gagal!', 'Semua field harus diisi.', 'error');
    return;
  }

  const data = {
    action: 'update',
    index: editingIndex,
    book: { title: updatedTitle, author: updatedAuthor, category: updatedCategory, status: updatedStatus }
  };

  await fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  Swal.fire('Berhasil!🙌🏽', 'Buku telah diperbarui.', 'success');
  const modal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
  modal.hide();
  fetchBooks(); 
});

async function deleteBook(index) {
  Swal.fire({
    title: 'Beneran mau menghapus buku ini? 😱',
    text: "Buku yang dihapus tidak bisa dikembalikan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const data = { action: 'delete', index: index };
      await fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      Swal.fire('Dihapus!', 'Buku telah dihapus.😰', 'success');
      fetchBooks(); 
    }
  });
}

fetchBooks();

document.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});


document.addEventListener('keydown', function(event) {
  
  if (event.key === 'F12') {
     event.preventDefault();
  }
  
  if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) {
     event.preventDefault();
  }
  
  if (event.ctrlKey && (event.key === 'U' || event.keyCode === 85)) {
    event.preventDefault();
}
});
 
 fetch('footer.html')
 .then(response => response.text())
 .then(data => {
   document.getElementById('footer').innerHTML = data;

   
   document.getElementById("currentYear").textContent = new Date().getFullYear();
 })
 .catch(error => console.error('Error loading footer:', error));