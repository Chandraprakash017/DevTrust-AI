export default function Card({ title, value }) {
  return (
    <div className="bg-white dark:bg-white/10 backdrop-blur-lg border border-gray-200 dark:border-white/20 p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300">

      <h3 className="text-gray-600 dark:text-gray-300 font-medium">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
        {value}
      </p>

    </div>
  );
}