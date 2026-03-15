"use client";

import { useRef } from 'react';
import { useMathJax } from '../../components/MathJax';

const TransformerPage = () => {
  const mathRef = useRef<HTMLDivElement>(null);
  const { MathJaxScript } = useMathJax(mathRef);

  return (
    <main>
      <MathJaxScript />
      <div className="pt-8 pb-4" ref={mathRef}>
        <h1 className="text-4xl font-bold">Transformer</h1>
        <div className="text-lg text-gray-600 dark:text-gray-400">

          <div className="card-subtitle pt-4">Motivation</div>
          <div className="card-text">
            The Transformer is a neural network model that is more efficient to train
            and run than previous models, and is able to take into account long range
            relationships in text. It is an auto-regressive model, meaning after
            generating a token, the generated token sequence is fed back into
            the model to generate the next token.
          </div>

          <div className="card-subtitle pt-4">Parallel Compute & the Vanishing Gradient Problem</div>
          <div className="card-text">
            The point of the Transformer was to be able to parallelize compute,
            to handle the vanishing gradient problem, and to capture long range
            relationships in text. An RNN uses data from previous tokens (if it 
            acts on text) or time steps (if it acts on time series data, like 
            audio or video), in the current step. This means the steps have to
            be computed one after another and cannot be done in parallel. The 
            Transformer runs on the full data set every iteration, and therefor
            has to encode position information another way. This is done using an
            explicit encoding, such as RoPE.
            The fact that the Transformer can process data in parallel has enabled
            training on much larger data sets than previous models. This turns
            out to have unlocked a whole new level of capabilities for natural
            language processing. Nearly all research of language models has focused
            on the Transformer since it's release in 2017. This has led to new
            products and major NLP advancements, but it also has come at the expense
            of not exploring other options model architectures that may hold promise.
          </div>

          <div className="card-subtitle pt-4">Tokenization</div>
          <div className="card-text">
            Tokenization is a way to divide up the data before it is processed through
            the network. The tokenization method is chosen independently of the Transformer.
          </div>

          <div className="card-subtitle pt-4">Embedding</div>
          <div className="card-text">
            Embedding is a way to represent tokens as vectors. The embedding is chosen
            independently of the Transformer.
          </div>

          <div className="card-subtitle pt-4">Attention</div>
          <div className="card-text">
            The meaning of words depend on what other words exist in the text,
            and where they appear in relation to the current word. People
            (Dzmitri Bahdanau) working on translation using RNNs came up with
            the concept of words attending to other words to confer context and
            meaning. They where comparing the words to each other using a small
            MLP that added up contributions from each word to the current word.
            The Transformer takes this one step further by
            creating three distinct vectors (Query, Key, Value) by multiplying
            the input embedding by three different learned weight matrices
            ($W_Q$, $W_K$, $W_V$). Key -- representing the type of word it is (e.g., a
            verb); Value -- representing what that word means (e.g., the
            semantic meaning of the verb). For each token, we gather the
            different amounts of the value vectors based on the similarity of
            the Query vector of that token with the Key vectors of the other
            tokens, and add them up. The dot product of the Query vector and
            the Key vector is scaled by {'$\\sqrt{d_k}$'} to prevent values 
            from getting too large. $d_k$ is the dimension of the embedding.
            <br />
            <br />
            On a more technical level, we take the embedding matrix that
            consists of the embedding vectors for all the tokens in the sequence,
            and multiply it by the weight matrices $W_Q$, $W_K$, $W_V$ to get the
            Query, Key, and Value vectors for each token. Each row of the embedding
            matrix is a token, and each column is a dimension of the embedding.
          </div>

          <div className="card-subtitle pt-4">Masking</div>
          <div className="card-text">
            Masking is used to zero out the attention weights for future tokens
            so that predicting token N only relies on tokens 1 through N−1. During
            training, this enforces the auto-regressive rule: the model must learn
            to predict the next word using only past context. During inference, even
            when the model is reading a fully provided prompt, this causal mask must
            still be applied. If the mask were dropped to let words look ahead, it
            would feed the network a bidirectional mathematical structure it has
            never seen before.
          </div>

          <div className="card-subtitle pt-4">Positional Encoding</div>
          <div className="card-text">
            The positional encoding using RoPE is done to the Q and K vectors
            before attention is calculated. Each vector is rotated in embedding
            space with the angle proportionate to the position the token
            appears. Note: the positional encoding used in the Attention is All
            You Need paper, was absolute sinusoidal positional encoding. RoPE
            is used in modern applications, however.
          </div>

          <div className="card-subtitle pt-4">Multi-head Attention</div>
          <div className="card-text">
            The system was found to be more expressive if you run multiple heads
            of attention in parallel, with each head ending up representing
            different kinds of information (syntactic, semantic, long range).
            All tokens are processed by each head, but the embedding dimension
            is divided across the heads., and they are then concatenated back
            up to the full size. n is in the range of 64 - 128.
          </div>

          <div className="card-subtitle pt-4">Residual Connections</div>
          <div className="card-text">
            Since this is a deep network, we need to deal with the vanishing
            gradient problem. In a Transformer, it's done by adding the input
            vector to the result of a layer. This adds a constant term to the
            gradient, which prevents it from becoming too small.
          </div>

          <div className="card-subtitle pt-4">Normalization</div>
          <div className="card-text">
            In order to stabilize the network during training, the input to the
            attention and MLP blocks is normalized by dividing each input vector
            by the square root of the sum of the squares of its elements (root
            mean square normalization). In the original Transformer paper,
            LayerNorm (which subtracts the mean and divides by the standard
            deviation) was used instead.
          </div>

          <div className="card-subtitle pt-4">Multi-layer Perceptron</div>
          <div className="card-text">
            The output vectors from the attention and normalization steps
            are each fed through a Multi-layer Perceptron (MLP).
            The MLP is a simple network that is applied to
            each token after the attention and normalization. It is a two layer
            MLP with a ReLU activation function. The MLP is used as a sort of
            memory bank to store facts from the training data.
          </div>

          <div className="card-subtitle pt-4">Model Output</div>
          <div className="card-text">
            The output of each pass through the Transformer is a probability
            distribution over the vocabulary.
            The model then samples from this probability distribution to choose
            the next token. A parameter called the temperature is used to tweak the output.
            The higher the temperature, the more chance to choose a lower
            probability word. This allows the model to generate different
            output for different invocations of the model.
            This process is repeated for the number of tokens to generate.
          </div>

        </div>
      </div>
    </main>
  );
};

export default TransformerPage;
