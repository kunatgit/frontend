import "./App.css";
// import swal from 'sweetalert';
import Swal from 'sweetalert2'


// import Axios from "axios";
import { useState, useEffect } from "react";

import DataTable from "react-data-table-component";

let urlService ="http://localhost:3001";


function App() {
  
  const columns = [
    {
      name: "Name",
      width: "200px",
      selector: (row) => row.name,
    },
    {
      name: "Age",
      width: "60px",
      selector: (row) => row.age,
    },
    {
      name: "Email",
      width: "160px",
      selector: (row) => row.email,
    },
    {
      name: "Avatar",
      cell: (row) => <img src={row.avatarUrl} width="50px" alt={row.avatarUrl}></img>,
      selector: (row) => row.avatarUrl
    },
    {
      name: "Function",
      width: "180px",
      cell: (row) => <div  className="functionBox" >
        <div>
          <button id={row.userId} type="button" onClick={updateUser} className="btn btn-secondary" width="20px" height="20px">Edit</button>
        </div>
        <div>
          <button id={row.userId} type="button" onClick={deleteUser} className="btn btn-danger">Delete</button>
        </div>
      </div>,
      selector: (row) => row.avatarUrl
    },
  ];
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [keyword, setKeyword] = useState("");
  const handleSearch = (event) => {
    console.log(event.target.value);
    setKeyword(event.target.value);
    fetchData(event.target.value,1, perPage);
  }
  useEffect(() => {
    console.log('start');
    fetchData(keyword,1, perPage);
  }, [keyword,perPage]);

  const fetchData = async (keyword,page, per_page) => {
    fetch(
      urlService+`/api/getDataAndPaging?keyword=${keyword}&page=${page}&per_page=${per_page}`
    )
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result.data);
          setTotalRows(result.total);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  };

  const handlePageChange = (page) => {
    fetchData(keyword,page, perPage);
  };
  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    fetchData(keyword,page, newPerPage);
  };

  const confirmDeleteUser = async (dataFilter) => {
    fetch(
      urlService+`/api/user/${dataFilter.userId}`
      , { method: 'DELETE' }
    )
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('result =>',result)
          if(result.hasOwnProperty('message')){
              if(result.message == "Delete success"){
                fetchData(keyword,1, perPage);
                
                Swal.fire(
                  'Deleted!',
                  dataFilter.name+' has been deleted.',
                  'success'
                )
              }else if (result.message == "Delete fail"){
                Swal.fire(
                  'Deleted!',
                  dataFilter.name+' has been deleted.',
                  'error'
                )
              }
          }
          
        },
        (error) => {
          console.log('result =>',error)
          Swal.fire(
            'Deleted!',
            dataFilter.name+' has been deleted.',
            'error'
          )
        }
      );
  };
  function deleteUser(event){
    let userId = event.target.id;
    console.log('userId =>',userId)
    let dataFilter = items.filter(item => item.userId == userId);
    dataFilter = dataFilter[0];
    console.log('dataFilter =>',dataFilter);
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDeleteUser(dataFilter);
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire(
          'Cancelled',
          'Delete '+dataFilter.name,
          'error'
        )
      }
    });
  }
  function updateUser(event){
    let userId = event.target.id;
    console.log('userId =>',userId)
    let dataFilter = items.filter(item => item.userId == userId);
    dataFilter = dataFilter[0];
    Swal.fire({
      title: ''+dataFilter.name,
      html:
        '<div class="updateBox">'+
        '<div><label>Name</label>'+
          '<input id="update-name" type="text" class="form-control" placeholder="Name">' +
        '</div>'+
        '<div><label>Age</label>'+
          '<input id="update-age" type="number" class="form-control" placeholder="Age">' +
        '</div>'+
        '<div><label>Email</label>'+
          '<input id="update-email" type="email" class="form-control" placeholder="Email">' +
        '</div>'+
        '</div>',
      showCancelButton: true,
      confirmButtonText: 'Yes, update it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true,
      preConfirm: function () {
        return new Promise(function (resolve) {
          resolve([
            document.getElementById("update-name").value,
            document.getElementById("update-age").value,
            document.getElementById("update-email").value
          ])
        })
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Update Start')
        
        var json = {
          "name": result.value[0],
          "age": result.value[1],
          "email":result.value[2]
        }
        console.log('json =>',json)
        console.log('json stringfy =>',JSON.stringify(json))
        
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(json)
        };
        fetch(
          urlService+`/api/user/${dataFilter.userId}`
          , requestOptions
        )
          .then((res) => res.json())
          .then(
            (result) => {
              console.log('result =>',result.message)
              if(result.hasOwnProperty('statusCode')){
                  if(result.statusCode == "200 OK"){
                    fetchData(keyword,1, perPage);
                    Swal.fire(
                      'Update Success!',
                      ''+result.message,
                      'success'
                    )
                  }else{
                    if(result.hasOwnProperty('message')){
                      Swal.fire(
                        'Update Failed!',
                        ''+JSON.stringify(result.message),
                        'error'
                      )
                    }
                    
                  }
              }
              
            },
            (error) => {
              console.log('result =>',error)
              Swal.fire(
                'Deleted!',
                dataFilter.name+' has been deleted.',
                'error'
              )
            }
          );
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire(
          'Cancelled',
          'Update '+dataFilter.name,
          'error'
        )
      }
    });
    document.getElementById("update-name").value = dataFilter.name;
    document.getElementById("update-age").value = dataFilter.age;
    document.getElementById("update-email").value = dataFilter.email;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <div className="app-header">
          <h1>Frontend page</h1>
        </div>
        <div className="app-body">
          <div>
            <input
                type="text"
                className="form-control"
                placeholder="Enter name or email."
                onChange={handleSearch}
              />
          </div>
          <div>
            <div>
              <DataTable
                columns={columns}
                data={items}
                pagination
                paginationServer
                paginationRowsPerPageOptions={[5, 10, 20, 50 , 100]}
                paginationTotalRows={totalRows}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
              />
            </div>
            ;
          </div>
        </div>
      </div>
    );
  }
}

export default App;
