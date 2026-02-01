import { useEffect, useState } from "react"; 
import api from '../api/axios';

function UserList(){
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    api.get('/users')
       .then(response => {
           setUsers(response.data);
       })
       .catch(err => {
           console.error("Gagal mengambil data:", err);
       })
       .finally(() => setLoading(false));
},[]);

if (loading) return <p>Memasak data ...</p>;

    return (
        <div>
            <h2>Daftar Anggota Koperasi</h2>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Role</th>
                        <th>Satker</th>
                        <th>Limit</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user=>(
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.role}</td>
                            <td>{user.satker}</td>
                            <td>Rp {user.limit_total.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserList;
