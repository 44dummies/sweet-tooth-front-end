import { useScrollLineAnimation } from "@/hooks/useScrollLineAnimation";

const ScrollLine = () => {
  const { svgRef, pathRef } = useScrollLineAnimation();

  return (
    <div className="scroll-line-container relative">
      <svg
        ref={svgRef}
        className="scroll-line-svg"
        viewBox="0 0 1001 7875"
        fill="none"
        preserveAspectRatio="xMidYmax meet"
      >
        <path
          ref={pathRef}
          d="M0 19C129.5 19 922.943 -67.3128 850.5 244C830.731 328.953 927.5 286.5 742.5 439.5C557.5 592.5 866 797 697 1054C528 1311 808.5 1136.5 798 1446.5C787.5 1756.5 561 1735.5 697 2077C833 2418.5 878.5 2306 742.5 2543C606.5 2780 697 3057 798 3116C899 3175 676 3415 833 3443C990 3471 616.5 3854.5 662 3969.5C707.5 4084.5 833 3938 864.5 4102C896 4266 693.5 4603.5 686.5 4861.5C679.5 5119.5 836.5 5105 815.5 5398C794.5 5691 607 5988.5 686.5 6186C771.49 6397.14 728.5 6371 728.5 6463C728.5 6555 817 6647 728.5 6779C640 6911 597.5 7108.5 833 7276.5C1068.5 7444.5 1062.5 7576 686.5 7576C310.5 7576 149 7866.5 0 7866.5"
          stroke="#3EB489"
          strokeWidth="16"
          className="scroll-line-path"
        />
      </svg>
    </div>
  );
};

export default ScrollLine;
