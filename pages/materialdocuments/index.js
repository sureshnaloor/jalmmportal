import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

export default function Materialdocs() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <Matdocs />
      {/* <div> inside the materialdocs component </div> */}
    </QueryClientProvider>
  );
}

// using the normal react-query
const getMatdocs = async () => {
  const response = await fetch(`/api/materialdocuments`);
      const json = await response.json();
      return json
}

// using the 'infinite query' to change to below
// const getMatdocs = async (page) => {
//   const response = await fetch(`/api/materialdocuments?page=${page}`);
//   const json = await response.json();
//   return json;
// };

function Matdocs() {
  // Access the client
  const queryClient = useQueryClient();
  const LIMIT = 10;

  // Queries
  // old query using normal react-query
  const query = useQuery({ queryKey: ['matdocs'], queryFn: getMatdocs })

  // using inifinite query

  // const { data, isSuccess, hasNextPage, fetchNextPage, isFetchingNextPage } =
  //   useInfiniteQuery("matdocs", ({ pageParam = 1 }) => getMatdocs(pageParam), {
  //     getNextPageParam: (lastPage, allPages) => {
  //       const nextPage =
  //         lastPage.length === LIMIT ? allPages.length + 1 : undefined;
  //       return nextPage;
  //     },
  //   });

  //   console.log(data)

    // old react-query usual return
  return (
    <div>
      <ul>
        {query.data?.map((matdoc) => (
          <li key={matdoc["material-code"]}>{matdoc["material-text"]}</li>
        ))}
      </ul>
    </div>
  );

  // using infinite query return

  // return (
  //   <div className="w-full p-3">
  //     {isSuccess &&
  //       data?.pages.map((page) =>
  //         page.map((matdoc, i) => (
  //             <div key={i}>
  //             <h2>{matdoc["material-code"]}</h2>
  //             <h3> {matdoc["material-text"]}</h3>
            
  //           </div>
  //         ))
  //       )}
  // //   </div>
  // );
}
