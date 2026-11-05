
// Chunking
// Lazy Loading
// Code Splitting
// Dynamic Bundling
// Dynamic Loading
// On Demand Loading

const Grocery = () => {
    const concepts = [
        "Chunking",
        "Code Splitting",
        "Dynamic Bundling",
        "Lazy Loading",
        "On Demand Loading",
        "Dynamic Loading",
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-orange-500 px-6 py-8 text-white">
                        <h1 className="text-2xl sm:text-3xl font-bold">
                            This is our Grocery store for -
                        </h1>
                        <p className="mt-2 text-orange-100 text-sm sm:text-base">
                            A separate bundle loaded only when you visit this route
                        </p>
                    </div>

                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Concepts demonstrated in this page
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {concepts.map((concept) => (
                                <li
                                    key={concept}
                                    className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
                                >
                                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                    <span className="text-gray-700 font-medium">{concept}</span>
                                </li>
                            ))}
                        </ul>

                        <p className="mt-6 text-sm text-gray-500 leading-relaxed">
                            I know they all are the same thing, just testing my skills!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Grocery
