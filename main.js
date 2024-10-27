'use strict';

const books = [];
const RENDER_EVENT = 'book-render';
const STORAGE_KEY = 'book-app';

const searchInput = document.getElementById('searchBookTitle');
const bookForm = document.getElementById('bookForm');
const bookFormId = document.getElementById('bookFormId');
const bookFormTitle = document.getElementById('bookFormTitle');
const bookFormAuthor = document.getElementById('bookFormAuthor');
const bookFormYear = document.getElementById('bookFormYear');
const bookFormIsComplete = document.getElementById('bookFormIsComplete');
const formHeader = document.getElementById('formHeader');
const btnAddBook = document.getElementById('btnAddBook');
const searchBook = document.getElementById('searchBook');
const completeBookList = document.getElementById('completeBookList');
const incompleteBookList = document.getElementById('incompleteBookList');

document.addEventListener(RENDER_EVENT, function () {
    if (books.length == 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Tidak ada data untuk ditampilkan.',
        });
        return;
    }
    return renderBooks(books);
});

function rerender() {
    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
    //check storage
    if (isStorageExist()) loadDataFromStorage();

    //form input
    bookForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formObject = Object.fromEntries(formData.entries());
        formObject.isComplete = formObject.isComplete ? true : false;

        // validasi
        if (formObject.year.length != 4) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Harus empat digit!',
            });
            return;
        }
        if (!formObject.id) {
            // new
            formObject.id = `${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 9)}`;
            books.push(formObject);

            rerender();
            saveDataToStorage('new');
        } else {
            const book = findBookById(formObject.id);
            book.title = formObject.title;
            book.author = formObject.author;
            book.year = formObject.year;
            book.isComplete = formObject.isComplete;

            rerender();
            saveDataToStorage('edit');
        }
        resetFormInput();
    });

    // button complete
    bookFormIsComplete.addEventListener('change', (e) => {
        const textButton = document.querySelector('#bookFormSubmit > span');
        if (e.target.checked) {
            textButton.innerText = 'Selesai dibaca';
        } else {
            textButton.innerText = 'Belum selesai dibaca';
        }
    });

    //form pencarian
    searchBook.addEventListener('submit', (e) => {
        e.preventDefault();
        rerender();
        searchInput.focus();
    });

    // reset pencarian
    searchBook.addEventListener('reset', (e) => {
        e.preventDefault();
        searchInput.value = '';
        rerender();
        searchInput.focus();
    });
});

function renderBooks(books) {
    const search = searchInput.value;
    let searched = null;
    if (search) {
        searched = books.filter(
            (book) =>
                book.title.toLowerCase().indexOf(search.toLowerCase()) >= 0
        );
    } else {
        searched = books;
    }

    const booksComplete = searched.filter((book) => book.isComplete == true);
    const booksIncomplete = searched.filter((book) => book.isComplete == false);

    const noData =
        '<p class="alert alert-info m-0 text-center" role="alert">Tidak ada data untuk ditampilkan!</p>';

    completeBookList.innerText = '';
    for (const book of booksComplete) {
        const bookElement = makeBook(book);
        completeBookList.appendChild(bookElement);
    }
    if (!completeBookList.innerText) completeBookList.innerHTML = noData;

    incompleteBookList.innerText = '';
    for (const book of booksIncomplete) {
        const bookElement = makeBook(book);
        incompleteBookList.appendChild(bookElement);
    }
    if (!incompleteBookList.innerText) incompleteBookList.innerHTML = noData;

    function makeBook(book) {
        const bookItem = document.createElement('div');
        bookItem.setAttribute('data-bookid', book.id);
        bookItem.setAttribute('data-testid', 'bookItem');

        const bookItemTitle = document.createElement('h3');
        bookItemTitle.innerText = book.title;
        bookItemTitle.setAttribute('data-testid', 'bookItemTitle');

        const bookItemAuthor = document.createElement('p');
        bookItemAuthor.innerText = '— Penulis: ' + book.author;
        bookItemAuthor.setAttribute('data-testid', 'bookItemAuthor');

        const bookItemYear = document.createElement('p');
        bookItemYear.innerText = '— Tahun: ' + book.year;
        bookItemYear.setAttribute('data-testid', 'bookItemYear');

        const btnComplete = document.createElement('button');
        btnComplete.setAttribute('data-testid', 'bookItemIsCompleteButton');
        btnComplete.classList = 'btn btn-success me-2';
        if (book.isComplete) {
            btnComplete.innerText = 'Belum selesai dibaca';
            btnComplete.addEventListener('click', (e) => {
                updateStatusBook(book.id, true);
            });
        } else {
            btnComplete.innerText = 'Selesai dibaca';
            btnComplete.addEventListener('click', (e) => {
                updateStatusBook(book.id, false);
            });
        }

        const btnDelete = document.createElement('button');
        btnDelete.setAttribute('data-testid', 'bookItemDeleteButton');
        btnDelete.innerText = 'Hapus Buku';
        btnDelete.classList = 'btn btn-danger me-2';
        btnDelete.addEventListener('click', function () {
            deleteBook(book.id);
        });

        const btnEdit = document.createElement('button');
        btnEdit.setAttribute('data-testid', 'bookItemEditButton');
        btnEdit.innerText = 'Edit Buku';
        btnEdit.classList = 'btn btn-warning';
        btnEdit.addEventListener('click', function () {
            fillInputForm(book);
        });

        const divButtons = document.createElement('div');
        divButtons.append(btnComplete, btnDelete, btnEdit);
        bookItem.append(
            bookItemTitle,
            bookItemAuthor,
            bookItemYear,
            divButtons
        );
        bookItem.classList = 'card px-4 py-2 m-2 bg-info-subtle';
        return bookItem;
    }

    function fillInputForm(book) {
        bookFormId.value = book.id;
        bookFormTitle.value = book.title;
        bookFormAuthor.value = book.author;
        bookFormYear.value = book.year;
        bookFormIsComplete.checked = book.isComplete;

        const btn = document.createElement('button');
        btn.classList = 'btn btn-primary float-end';
        btn.innerText = 'Tambah Buku';
        btn.onclick = resetFormInput;
        formHeader.innerHTML = '';
        formHeader.append('Edit Buku', btn);
    }
}

function resetFormInput() {
    formHeader.innerText = 'Tambah Buku Baru';
    bookFormId.value = '';
    bookForm.reset();
    bookFormTitle.focus();
}

function findBookById(id) {
    const book = books.find((book) => book.id == id);
    return book || false;
}

function deleteBook(id) {
    const index = books.findIndex((book) => book.id === id);
    if (index !== -1) {
        Swal.fire({
            title: 'Yakin mau menghapus buku ini?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya. Hapus',
            cancelButtonText: 'Tidak',
        }).then((result) => {
            if (result.isConfirmed) {
                books.splice(index, 1);
                Swal.fire({
                    icon: 'success',
                    title: 'Buku Dihapus!',
                    showConfirmButton: false,
                    timer: 1500,
                });
                rerender();
                saveDataToStorage('delete');
            }
        });
    }
}

function updateStatusBook(id, status) {
    const book = books.find((book) => book.id == id);
    if (book) {
        Swal.fire({
            title: 'Update status buku?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Tidak',
        }).then((result) => {
            if (result.isConfirmed) {
                book.isComplete = !status;
                rerender();
                saveDataToStorage('edit');
            }
        });
    }
}

function isStorageExist() {
    if (typeof Storage === undefined) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Browser kamu tidak mendukung local storage!',
        });
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (!serializedData) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Belum ada data untuk ditampilkan. Silakan input data!',
        });
        return;
    }

    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    rerender();
}

function saveDataToStorage(status) {
    if (isStorageExist()) {
        const stringJSON = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, stringJSON);
        if (status) {
            let text;
            if (status == 'edit') {
                text = 'Data buku berhasil diupdate';
            } else if (status == 'new') {
                text = 'Buku baru berhasil ditambahkan';
            } else if (status == 'delete') {
                text = 'Buku berhasil dihapus';
            }
            Swal.fire({
                icon: 'success',
                title: text,
                showConfirmButton: false,
                timer: 1500,
            });
        }
    }
}
