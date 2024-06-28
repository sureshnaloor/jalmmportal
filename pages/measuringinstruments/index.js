import HeaderComponent from "../../components/HeaderComponent";
import FooterComponent from "../../components/FooterComponent";

function Measuringinstruments() {
  return (
    <>
      <HeaderComponent />
      <div className="min-h-screen p-3">
        <div className="mt-3 bg-slate-50 ">
          Testing fresh attempt at MME equipments using search on different
          fixedassetlist Search on Asset code Search on legacy code Search on
          Description wild card text
        </div>

        <div className="grid grid-cols-8">
            <div className="bg-pink-100 col-span-2" > left section</div>
            <div className="bg-sky-100 col-span-6"> Right section holding the form and values </div>
        </div>
      </div>

      <FooterComponent />
    </>
  );
}

export default Measuringinstruments;
