const Shimmer = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 p-4 md:px-8 md:py-6">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-64" />
                ))}
            </div>
        </div>
    )
}

export default Shimmer;
