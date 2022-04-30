
function Usercomponent({matgroups, id}) {
  return (
    <div className="bg-slate-50 dark:bg-dark-primary" id={id}>
      {matgroups.map((matgroup) => (
        <div key={matgroup._id}>
          <p>{matgroup["material-group"]}</p>
          <p>{matgroup["matgroup-primary-desc"]}</p>
          <p>{matgroup["matgroup-secondary-desc"]}</p>
        </div>
      ))}
    </div>
  );
}

export default Usercomponent