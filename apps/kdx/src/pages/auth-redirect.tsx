//import type { GetServerSideProps } from "next";

//import { getToken } from "next-auth/jwt";

// export const getServerSideProps: GetServerSideProps = async ({ req }) => {
//   //const sessionToken = await getToken({ req, raw: true });
//   console.log("hi");
//   return {
//     props: {},
//     redirect: {
//       destination: `http://localhost:5173?token=$}}`,
//       permanent: false,
//     },
//   };
// };

export default function AuthRedirect() {
  return <>Redirecting...</>;
}
