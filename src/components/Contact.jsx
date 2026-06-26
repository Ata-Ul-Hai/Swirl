const Contact = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h1 className="font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
            Contact Us Page
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Have a question? Send us a message and we&apos;ll get back to you.
          </p>

          <form className="flex flex-col gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-orange-400 outline-none bg-white"
                placeholder="name"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <input
                id="message"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-orange-400 outline-none bg-white"
                placeholder="message"
              />
            </div>

            <button
              type="submit"
              className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
