let currentSequence = 1;

export const generateOrderId = (dateStr, storyId) => {
    const formattedDate = dateStr.replace(/\//g, "");
    const seqStr = currentSequence.toString().padStart(3, "0");
    currentSequence += 1;
    return `${formattedDate}${storyId}${seqStr}`;
};