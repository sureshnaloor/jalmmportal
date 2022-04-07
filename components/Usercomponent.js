
function Usercomponent({users}) {
  return (
    <div className="bg-slate-50 dark:bg-dark-primary">
      {users.map((user) => (
        <>
          <p>{user.email}</p>
          <p>{user.name}</p>
        </>
      ))}
    </div>
  );
}

export default Usercomponent